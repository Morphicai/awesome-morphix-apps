import { reportError } from '@morphixai/lib';

/**
 * 分享服务 - 生成分享图
 */
export class ShareService {
  /**
   * 使用 snapDOM 生成高质量分享图
   * @param {HTMLElement} element - 要转换为图片的 DOM 元素
   * @param {Object} options - 配置选项
   * @returns {Promise<string>} - 返回图片的 Data URL
   */
  static async generateImageFromDOM(element, options = {}) {
    try {
      const {
        type = 'png',
        quality = 1,
        backgroundColor = '#ffffff',
        scale = 2 // 提高清晰度
      } = options;

      // 使用 remoteImport 动态加载 snapdom
      const snapDOMModule = await remoteImport('@zumer/snapdom');
      const snapDOM = snapDOMModule.default ?? snapDOMModule.snapdom;
      
      console.log('✅ snapDOM 对象:', snapDOM);
      console.log('✅ snapDOM 可用方法:', Object.keys(snapDOM));
      
      // snapDOM 通常提供 toCanvas 方法，然后我们从 canvas 获取 dataURL
      const canvas = await snapDOM.toCanvas(element, {
        backgroundColor,
        scale
      });
      
      console.log('✅ Canvas 对象:', canvas);
      
      // 从 canvas 转换为 Data URL
      const imageUrl = canvas.toDataURL(`image/${type}`, quality);
      
      console.log('✅ 图片 URL 类型:', typeof imageUrl);
      console.log('✅ 图片 URL 开头:', imageUrl.substring(0, 50));

      return imageUrl;
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'ShareService',
        action: 'generateImageFromDOM'
      });
      throw error;
    }
  }

  /**
   * 下载图片到本地
   * @param {string} dataUrl - 图片的 Data URL
   * @param {string} fileName - 文件名
   */
  static downloadImage(dataUrl, fileName) {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName || `百万问AI_分享图_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      reportError(error, 'JavaScriptError', {
        component: 'ShareService',
        action: 'downloadImage'
      });
      throw error;
    }
  }
  /**
   * 生成分享图片
   */
  static async generateShareImage(type, data) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 设置画布尺寸
      canvas.width = 750;
      canvas.height = type === 'solution' ? 1200 : 1000;

      // 设置背景渐变
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 设置文字样式
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 32px Arial';

      // 绘制标题
      const title = type === 'solution' ? '行动蓝图' : '董事会决议报告';
      ctx.fillText(title, canvas.width / 2, 80);

      // 绘制副标题
      ctx.font = '20px Arial';
      ctx.fillStyle = '#f0f0f0';
      if (type === 'solution') {
        ctx.fillText(`核心议题：${data.question}`, canvas.width / 2, 120);
      } else {
        ctx.fillText(`关于"${data.idea}"项目的董事会决议`, canvas.width / 2, 120);
      }

      // 绘制内容区域背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(40, 160, canvas.width - 80, canvas.height - 200);

      // 绘制内容
      this.drawContent(ctx, type, data, canvas.width);

      // 绘制底部信息
      ctx.fillStyle = '#666666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('百万问AI - 让智慧触手可及', canvas.width / 2, canvas.height - 30);

      // 转换为图片并下载
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `百万问AI_${type === 'solution' ? '行动蓝图' : '董事会报告'}_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve(true);
          } else {
            reject(new Error('生成图片失败'));
          }
        }, 'image/png');
      });
    } catch (error) {
      await reportError(error, 'JavaScriptError', {
        component: 'ShareService',
        action: 'generateShareImage',
        type
      });
      throw error;
    }
  }

  /**
   * 绘制内容
   */
  static drawContent(ctx, type, data, canvasWidth) {
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.font = '16px Arial';

    let y = 200;
    const lineHeight = 25;
    const margin = 60;

    if (type === 'solution') {
      // 解决方案内容
      const sections = [
        '1. 核心风险识别',
        '• 现金流风险: 项目启动初期的主要开销在哪里？',
        '• 市场风险: 目标客群是否足够大？',
        '• 运营风险: 运营成本如何控制？',
        '',
        '2. 盈利模式探索',
        '• 基础收入: 制定核心盈利模式',
        '• 增值服务: 提供高利润的增值服务',
        '• 社群变现: 组织付费活动',
        '',
        '3. 下一步行动建议',
        '1. 最小化验证: 测试市场反应',
        '2. 财务模型测算: 计算盈亏平衡点',
        '3. 用户访谈: 深入了解用户需求'
      ];

      sections.forEach(line => {
        if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
          ctx.font = 'bold 18px Arial';
          ctx.fillStyle = '#007AFF';
        } else if (line.startsWith('•') || /^\d+\./.test(line)) {
          ctx.font = '16px Arial';
          ctx.fillStyle = '#555555';
        } else {
          ctx.font = '16px Arial';
          ctx.fillStyle = '#333333';
        }

        ctx.fillText(line, margin, y);
        y += lineHeight;
      });
    } else {
      // 董事会报告内容
      const sections = [
        '领航人分析报告',
        `领航人：${data.navigator || '未选择'}`,
        '',
        '基于您的项目，从战略高度提供以下分析：',
        '• 市场定位：明确目标用户群体和核心价值主张',
        '• 商业模式：采用多元化收入结构',
        '• 执行策略：分阶段推进验证',
        '',
        '董事会成员意见',
        `参与成员：${data.members || '未选择'}`,
        '',
        '• 财务角度：制定详细的财务预算',
        '• 技术角度：确保技术架构可扩展性',
        '• 市场角度：进行充分的市场调研',
        '',
        '董事会决议',
        '经过充分讨论，董事会一致通过以下决议：',
        '1. 项目可行性：项目具有市场潜力',
        '2. 资金需求：预计需要启动资金50-100万元',
        '3. 时间规划：6个月内完成MVP',
        '4. 风险控制：建立完善的风险评估机制'
      ];

      sections.forEach(line => {
        if (line === '领航人分析报告' || line === '董事会成员意见' || line === '董事会决议') {
          ctx.font = 'bold 20px Arial';
          ctx.fillStyle = '#007AFF';
        } else if (line.startsWith('•') || /^\d+\./.test(line)) {
          ctx.font = '16px Arial';
          ctx.fillStyle = '#555555';
        } else {
          ctx.font = '16px Arial';
          ctx.fillStyle = '#333333';
        }

        ctx.fillText(line, margin, y);
        y += lineHeight;
      });
    }
  }
}
