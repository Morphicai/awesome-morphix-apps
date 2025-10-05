import React, { useState, useRef } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import ShareTemplate from '../ShareTemplate';
import ShareImageModal from '../modals/ShareImageModal';
import { ShareService } from '../../services/ShareService';
import styles from '../../styles/ShareDemoPage.module.css';

/**
 * 分享功能演示页面 - 用于测试 Snapdom 集成
 */
export default function ShareDemoPage() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('solution');
  const shareTemplateRef = useRef(null);

  // 测试数据
  const solutionData = {
    question: '如何在三个月内将我的创业项目盈利？',
    mentorName: '巴菲特',
    sections: [
      {
        title: '核心风险识别',
        items: [
          '现金流风险：项目启动初期需要重点关注现金流管理',
          '市场风险：目标客群规模需要进一步验证',
          '运营风险：成本控制和团队建设是关键挑战'
        ]
      },
      {
        title: '盈利模式探索',
        items: [
          '基础收入：建立稳定的核心业务收入来源',
          '增值服务：提供高利润率的增值服务',
          '社群变现：构建付费社群提供持续价值'
        ]
      },
      {
        title: '下一步行动建议',
        items: [
          '1. MVP 验证：用最小成本测试市场反应',
          '2. 财务建模：详细计算盈亏平衡点',
          '3. 用户访谈：深入了解目标用户真实需求',
          '4. 迭代优化：根据反馈快速调整产品方向'
        ]
      }
    ]
  };

  const boardData = {
    idea: '智能健身 APP 创业项目',
    navigator: '马斯克',
    members: '贝佐斯、库克、纳德拉',
    sections: [
      {
        title: '领航人分析报告',
        items: [
          '领航人：马斯克',
          '该项目展现出明显的创新潜力和市场机会。',
          '技术可行性：利用 AI 和传感器技术提供个性化健身方案',
          '市场空间：全球健身市场规模超千亿美元',
          '竞争优势：结合硬件和软件的生态系统战略'
        ]
      },
      {
        title: '董事会成员意见',
        items: [
          '参与成员：贝佐斯、库克、纳德拉',
          '贝佐斯 - 商业模式',
          '• 建议采用订阅制 + 硬件销售的混合模式',
          '• 关注用户留存率和 LTV 指标',
          '库克 - 产品设计',
          '• 强调用户体验和设计美学',
          '• 建议开发配套智能硬件生态',
          '纳德拉 - 技术架构',
          '• 采用云原生架构确保可扩展性',
          '• 利用 AI 和大数据提供个性化服务'
        ]
      },
      {
        title: '董事会决议',
        items: [
          '经过充分讨论，董事会一致通过以下决议：',
          '1. 项目可行性：项目具有显著市场潜力，建议启动',
          '2. 资金需求：预计需要种子轮融资 500 万元',
          '3. 时间规划：6 个月内完成 MVP，12 个月内正式上线',
          '4. 风险控制：建立完善的里程碑和风险评估机制',
          '5. 团队建设：优先招募技术和运营核心人员'
        ]
      }
    ]
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setShowShareModal(true);
      setShareImageUrl(null);

      // 等待 DOM 渲染
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!shareTemplateRef.current) {
        throw new Error('模板未找到');
      }

      // 生成图片
      const imageUrl = await ShareService.generateImageFromDOM(
        shareTemplateRef.current,
        {
          type: 'png',
          quality: 1,
          backgroundColor: 'transparent',
          scale: 2
        }
      );

      setShareImageUrl(imageUrl);
      setIsGenerating(false);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败: ' + error.message);
      setShowShareModal(false);
      setIsGenerating(false);
    }
  };

  const currentData = selectedType === 'solution' ? solutionData : boardData;
  const fileName = selectedType === 'solution' 
    ? '百万问AI_行动蓝图_演示.png'
    : '百万问AI_董事会报告_演示.png';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Snapdom 分享功能演示</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={styles.container}>
          <div className={styles.section}>
            <h2>📸 Snapdom 长图分享功能测试</h2>
            <p>选择模板类型并点击生成按钮，测试 DOM 转图片功能。</p>
          </div>

          <div className={styles.section}>
            <h3>选择模板类型</h3>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="solution"
                  checked={selectedType === 'solution'}
                  onChange={(e) => setSelectedType(e.target.value)}
                />
                <span>行动蓝图（Solution）</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="board"
                  checked={selectedType === 'board'}
                  onChange={(e) => setSelectedType(e.target.value)}
                />
                <span>董事会报告（Board）</span>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <button 
              className={styles.generateButton}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '🎨 生成分享长图'}
            </button>
          </div>

          <div className={styles.section}>
            <h3>📋 测试数据预览</h3>
            <div className={styles.dataPreview}>
              <pre>{JSON.stringify(currentData, null, 2)}</pre>
            </div>
          </div>

          <div className={styles.section}>
            <h3>✅ 功能特性</h3>
            <ul>
              <li>✨ 使用 @zumer/snapdom 将 DOM 转换为图片</li>
              <li>🎨 精美的渐变背景设计</li>
              <li>📱 固定宽度 750px，适合移动端分享</li>
              <li>🔍 2倍分辨率，确保高清输出</li>
              <li>👀 即时预览生成的图片</li>
              <li>📥 一键下载到本地</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3>🔧 技术说明</h3>
            <div className={styles.codeBlock}>
              <code>
                {`// 核心实现
const imageUrl = await ShareService.generateImageFromDOM(
  element,
  {
    type: 'png',
    quality: 1,
    backgroundColor: 'transparent',
    scale: 2  // 2倍分辨率
  }
);`}
              </code>
            </div>
          </div>
        </div>

        {/* 隐藏的分享模板 */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={shareTemplateRef}>
            <ShareTemplate type={selectedType} data={currentData} />
          </div>
        </div>

        {/* 预览模态框 */}
        <ShareImageModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          imageUrl={shareImageUrl}
          fileName={fileName}
        />
      </IonContent>
    </IonPage>
  );
}
