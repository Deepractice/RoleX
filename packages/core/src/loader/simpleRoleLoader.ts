/**
 * Simple Role Loader
 * 简单的角色加载器，不使用 DPML，直接文本替换
 * 使用 ARP 无状态解析资源引用
 */

import type { RXR } from "resourcexjs";
import type { RenderedRole } from "~/types.js";
import { RoleLoadError } from "~/errors.js";

/**
 * 简单加载角色（不使用 DPML）
 * 1. 从 RXR 读取文件
 * 2. 解析 @!protocol://path 引用（从 RXR 内部文件读取）
 * 3. 简单文本拼接
 */
export async function loadRoleSimple(rxr: RXR): Promise<RenderedRole> {
  const files = await rxr.content.files();

  // 1. 找主文件
  let mainFileName = Array.from(files.keys()).find((f) => f.endsWith(".role.pml"));
  if (!mainFileName) {
    mainFileName = Array.from(files.keys()).find((f) => f.endsWith(".role.md"));
  }

  if (!mainFileName) {
    throw new RoleLoadError("No .role.pml or .role.md file found", rxr.locator.toString());
  }

  const mainFileBuffer = files.get(mainFileName);
  if (!mainFileBuffer) {
    throw new RoleLoadError(`Failed to read main file: ${mainFileName}`, rxr.locator.toString());
  }

  const mainContent = mainFileBuffer.toString("utf-8");

  // 2. 提取三个部分
  const personality = extractSection(mainContent, "personality");
  const principle = extractSection(mainContent, "principle");
  const knowledge = extractSection(mainContent, "knowledge");

  // 3. 处理引用（从 RXR 读取）
  const resolvedPersonality = await resolveReferences(personality, files);
  const resolvedPrinciple = await resolveReferences(principle, files);
  const resolvedKnowledge = await resolveReferences(knowledge, files);

  // 4. 拼接最终 prompt
  const prompt = `Personality:\n${resolvedPersonality}\n\nPrinciple:\n${resolvedPrinciple}\n\nKnowledge:\n${resolvedKnowledge}`;

  return {
    personality: resolvedPersonality,
    principle: resolvedPrinciple,
    knowledge: resolvedKnowledge,
    prompt,
  };
}

/**
 * 提取标签内容
 */
function extractSection(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * 从 files 中获取文件，支持带 ./ 前缀和不带前缀的路径
 */
function getFile(files: Map<string, Buffer>, path: string): Buffer | undefined {
  // 先尝试原始路径
  let buffer = files.get(path);
  if (buffer) return buffer;

  // 尝试带 ./ 前缀
  buffer = files.get(`./${path}`);
  if (buffer) return buffer;

  // 尝试去掉 ./ 前缀
  if (path.startsWith("./")) {
    buffer = files.get(path.slice(2));
    if (buffer) return buffer;
  }

  return undefined;
}

/**
 * 解析引用并替换
 * 支持：
 * - @!thought://xxx
 * - <resource src="arp:text:rxr://domain/name@version/path/file.pml"/>
 */
async function resolveReferences(content: string, files: Map<string, Buffer>): Promise<string> {
  let resolved = content;

  // 1. 处理 @!protocol://path 格式
  const oldStyleRegex = /@!([a-z]+):\/\/([a-zA-Z0-9_-]+)/g;
  resolved = resolved.replace(oldStyleRegex, (_match, protocol, name) => {
    // 尝试 .pml 后缀
    const pmlPath = `${protocol}/${name}.${protocol}.pml`;
    let fileBuffer = getFile(files, pmlPath);
    if (fileBuffer) {
      return fileBuffer.toString("utf-8");
    }

    // 尝试 .md 后缀
    const mdPath = `${protocol}/${name}.${protocol}.md`;
    fileBuffer = getFile(files, mdPath);
    if (fileBuffer) {
      return fileBuffer.toString("utf-8");
    }

    console.warn(`Referenced file not found: ${pmlPath} or ${mdPath}`);
    return "";
  });

  // 2. 处理 <resource src="..."/> 格式
  const resourceRegex = /<resource\s+src="arp:text:rxr:\/\/[^/]+\/[^/]+@[^/]+\/([^"]+)"\s*\/>/g;
  resolved = resolved.replace(resourceRegex, (_match, filePath) => {
    const fileBuffer = getFile(files, filePath);
    if (!fileBuffer) {
      console.warn(`Referenced file not found: ${filePath}`);
      return "";
    }
    return fileBuffer.toString("utf-8");
  });

  return resolved.trim();
}
