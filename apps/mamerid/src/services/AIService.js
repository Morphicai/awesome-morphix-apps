import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

/**
 * AI服务 - 处理AI相关功能
 */
export class AIService {
    /**
     * 使用AI修复Mermaid代码
     * @param {string} code - 错误的代码
     * @param {string} errorMessage - 错误信息
     * @returns {Promise<{success: boolean, fixedCode?: string, explanation?: string}>}
     */
    static async fixMermaidCode(code, errorMessage) {
        try {
            const systemPrompt = `你是一个Mermaid图表专家。你的任务是分析错误的Mermaid代码并修复它。

规则：
1. 只返回修复后的代码，不要添加任何解释文字
2. 不要使用markdown代码块包裹
3. 确保语法完全正确
4. 保持原有的图表结构和意图
5. 如果代码无法修复，返回一个简单的示例图表`;

            const userPrompt = `以下Mermaid代码出现了错误：

错误信息：
${errorMessage}

错误代码：
\`\`\`
${code}
\`\`\`

请修复这段代码，只返回修复后的Mermaid代码，不要添加任何其他内容。`;

            const response = await AppSdk.AI.chat({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                options: {
                    model: "openai/gpt-4o",
                    temperature: 0.3  // 较低的温度以获得更稳定的结果
                }
            });

            // 提取修复后的代码
            let fixedCode = this.formatResponse(response);
            
            // 清理可能的markdown代码块包裹
            fixedCode = fixedCode.replace(/```mermaid\n?/g, '');
            fixedCode = fixedCode.replace(/```\n?/g, '');
            fixedCode = fixedCode.trim();

            return {
                success: true,
                fixedCode: fixedCode,
                explanation: '已使用AI修复代码'
            };
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'AIService',
                action: 'fixMermaidCode',
                errorMessage: errorMessage
            });
            return {
                success: false,
                explanation: '修复失败：' + error.message
            };
        }
    }

    /**
     * 根据文字描述生成Mermaid代码
     * @param {string} description - 用户的描述
     * @returns {Promise<{success: boolean, code?: string, explanation?: string}>}
     */
    static async generateMermaidFromDescription(description) {
        try {
            const systemPrompt = `你是一个专业的Mermaid图表专家。你的任务是根据用户的描述生成准确、美观的Mermaid流程图代码。

规则：
1. 只返回Mermaid代码，不要添加任何解释文字
2. 不要使用markdown代码块包裹
3. 使用graph TD（从上到下）或graph LR（从左到右）作为主要方向
4. 确保语法完全正确
5. 使用中文标签
6. 适当使用形状：
   - [矩形] 表示步骤
   - {菱形} 表示判断
   - ([圆角矩形]) 表示开始/结束
   - [(圆柱形)] 表示数据库
7. 使用清晰的箭头标签说明流程
8. 保持图表简洁明了`;

            const userPrompt = `请根据以下描述生成Mermaid流程图代码：

${description}

只返回Mermaid代码，不要添加任何其他内容。`;

            const response = await AppSdk.AI.chat({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                options: {
                    model: "openai/gpt-4o",
                    temperature: 0.5
                }
            });

            // 提取生成的代码
            let code = this.formatResponse(response);
            
            // 清理可能的markdown代码块包裹
            code = code.replace(/```mermaid\n?/g, '');
            code = code.replace(/```\n?/g, '');
            code = code.trim();

            return {
                success: true,
                code: code,
                explanation: '流程图已生成'
            };
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'AIService',
                action: 'generateMermaidFromDescription',
                description: description
            });
            return {
                success: false,
                explanation: '生成失败：' + error.message
            };
        }
    }

    /**
     * 格式化AI响应
     * @param {any} response - AI响应
     * @returns {string}
     */
    static formatResponse(response) {
        if (typeof response === 'string') {
            return response;
        }
        if (response?.content) {
            return response.content;
        }
        if (response?.choices?.[0]?.message?.content) {
            return response.choices[0].message.content;
        }
        return '无法解析AI响应';
    }
}

export default AIService;

