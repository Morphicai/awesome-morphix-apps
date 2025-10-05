import React, { useState, useEffect } from 'react';
import styles from '../styles/ShareTemplate.module.css';

/**
 * 分享长图模板组件 - 用于被 snapdom 转换为图片
 */
export default function ShareTemplate({ type, data }) {
  if (type === 'solution') {
    return <SolutionShareTemplate data={data} />;
  } else if (type === 'board') {
    return <BoardShareTemplate data={data} />;
  }
  return null;
}

/**
 * 二维码组件
 */
function QRCodeImage() {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      // 使用 remoteImport 加载 qrcode 库
      const QRCode = await remoteImport('qrcode');
      
      // 获取当前页面URL，去掉hash部分
      const currentUrl = window.location.href.split('#')[0];
      
      console.log('🔗 生成二维码的URL:', currentUrl);
      
      // 生成二维码 Data URL
      const qrDataUrl = await QRCode.toDataURL(currentUrl, {
        width: 80,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('❌ 二维码生成失败:', error);
    }
  };

  if (!qrCodeUrl) {
    return (
      <div className={styles.qrPlaceholder}>
        生成中...
      </div>
    );
  }

  return (
    <img 
      src={qrCodeUrl} 
      alt="扫码体验" 
      className={styles.qrCode}
    />
  );
}

/**
 * 解决方案分享模板
 */
function SolutionShareTemplate({ data }) {
  const { question, mentorName, sections } = data;

  return (
    <div className={styles.template}>
      <div className={styles.header}>
        <div className={styles.logo}>百万问AI</div>
        <div className={styles.title}>行动蓝图</div>
        <div className={styles.mentor}>由 {mentorName} 提供</div>
      </div>

      <div className={styles.question}>
        <div className={styles.questionLabel}>核心议题</div>
        <div className={styles.questionText}>"{question}"</div>
      </div>

      <div className={styles.content}>
        {sections && sections.map((section, index) => (
          <div key={index} className={styles.section}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>{index + 1}</span>
              {section.title}
            </div>
            <div className={styles.sectionContent}>
              {section.items && section.items.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.item}>
                  <span className={styles.bullet}>•</span>
                  <span className={styles.itemText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerText}>百万问AI - 让智慧触手可及</div>
        <QRCodeImage />
      </div>
    </div>
  );
}

/**
 * 董事会报告分享模板
 */
function BoardShareTemplate({ data }) {
  const { idea, navigator, members, sections } = data;

  return (
    <div className={styles.template}>
      <div className={styles.header}>
        <div className={styles.logo}>百万问AI</div>
        <div className={styles.title}>董事会决议报告</div>
      </div>

      <div className={styles.question}>
        <div className={styles.questionLabel}>项目名称</div>
        <div className={styles.questionText}>"{idea}"</div>
      </div>

      <div className={styles.boardInfo}>
        <div className={styles.boardItem}>
          <span className={styles.boardLabel}>领航人：</span>
          <span className={styles.boardValue}>{navigator || '未选择'}</span>
        </div>
        <div className={styles.boardItem}>
          <span className={styles.boardLabel}>董事会成员：</span>
          <span className={styles.boardValue}>{members || '未选择'}</span>
        </div>
      </div>

      <div className={styles.content}>
        {sections && sections.map((section, index) => (
          <div key={index} className={styles.section}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📋</span>
              {section.title}
            </div>
            <div className={styles.sectionContent}>
              {section.items && section.items.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.item}>
                  <span className={styles.bullet}>•</span>
                  <span className={styles.itemText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerText}>百万问AI - 让智慧触手可及</div>
        <QRCodeImage />
      </div>
    </div>
  );
}
