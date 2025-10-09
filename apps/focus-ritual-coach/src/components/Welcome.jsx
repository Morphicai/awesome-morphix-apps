import React from 'react';
import { IonButton, IonCard, IonIcon } from '@ionic/react';
import { sparkles, flame, timer } from 'ionicons/icons';
import styles from '../styles/Welcome.module.css';

/**
 * 欢迎组件 - Focus Ritual Coach
 * 
 * @component
 * @param {Function} onStart - 开始仪式的回调函数
 */
export default function Welcome({ onStart }) {
    return (
        <div className={styles.welcomeContainer}>
            {/* 头部 */}
            <div className={styles.header}>
                <div className={styles.icon}>
                    <IonIcon icon={flame} className={styles.iconMain} />
                </div>

                <h1 className={styles.title}>
                    <span className={styles.titleGradient}>Focus Ritual</span>
                    <span className={styles.titleSubtext}>Coach</span>
                </h1>
                <p className={styles.subtitle}>构建你的专注仪式，让工作进入心流</p>
            </div>

            {/* 功能介绍 */}
            <div className={styles.features}>
                <IonCard className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                        <IonIcon icon={sparkles} />
                    </div>
                    <h3>情绪签到</h3>
                    <p>记录此刻的心情与能量状态</p>
                </IonCard>

                <IonCard className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                        <IonIcon icon={sparkles} />
                    </div>
                    <h3>AI 激励</h3>
                    <p>获取个性化的建议与行动指引</p>
                </IonCard>

                <IonCard className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                        <IonIcon icon={timer} />
                    </div>
                    <h3>专注计时</h3>
                    <p>25分钟专注时光，保持心流状态</p>
                </IonCard>
            </div>

            {/* 开始按钮 */}
            <div className={styles.ctaSection}>
                <IonButton
                    expand="block"
                    size="large"
                    onClick={onStart}
                    className={styles.startButton}
                >
                    <IonIcon icon={flame} slot="start" />
                    开始仪式
                </IonButton>
                <p className={styles.hint}>只需 3-5 分钟，开启专注的一天</p>
            </div>

            {/* 底部说明 */}
            <div className={styles.footer}>
                <p className={styles.footerText}>
                    💡 建议：每天早晨或需要专注时使用，帮助你快速进入状态
                </p>
            </div>
        </div>
    );
}
