/**
 * ImageService 集成测试
 * 用于验证图片生成和保存功能
 */

import ImageService from './ImageService';
import { createCoupon } from '../utils/types';

/**
 * 测试图片生成功能
 */
async function testImageGeneration() {
  console.log('Testing ImageService...');
  
  const imageService = new ImageService();
  
  // 创建测试优惠券
  const testCoupon = createCoupon({
    id: 'test-001',
    code: 'ABC123',
    amount: 50,
    isUsed: false,
    createdAt: new Date()
  });
  
  try {
    // 测试图片生成
    console.log('1. Testing image generation...');
    const base64Data = await imageService.generateCouponImage(testCoupon);
    console.log('✓ Image generated successfully');
    console.log('Base64 data length:', base64Data.length);
    
    // 测试已使用优惠券的图片生成
    console.log('2. Testing used coupon image generation...');
    const usedCoupon = { ...testCoupon, isUsed: true, usedAt: new Date() };
    const usedBase64Data = await imageService.generateCouponImage(usedCoupon);
    console.log('✓ Used coupon image generated successfully');
    
    // 测试自定义配置
    console.log('3. Testing custom config...');
    const customConfig = {
      width: 500,
      height: 250,
      fontSize: { amount: 36, code: 28, label: 18 }
    };
    const customBase64Data = await imageService.generateCouponImage(testCoupon, customConfig);
    console.log('✓ Custom config image generated successfully');
    
    // 测试保存到相册功能（注意：这需要在真实设备上测试）
    console.log('4. Testing save to album...');
    const saveResult = await imageService.saveImageToAlbum(base64Data, 'test_coupon.png');
    console.log('Save result:', saveResult);
    
    // 测试生成并保存功能
    console.log('5. Testing generate and save...');
    const generateAndSaveResult = await imageService.generateAndSaveImage(testCoupon);
    console.log('Generate and save result:', generateAndSaveResult);
    
    console.log('✓ All ImageService tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('✗ ImageService test failed:', error);
    return false;
  }
}

/**
 * 测试配置管理功能
 */
function testConfigManagement() {
  console.log('Testing config management...');
  
  const imageService = new ImageService();
  
  // 获取默认配置
  const defaultConfig = imageService.getDefaultConfig();
  console.log('Default config:', defaultConfig);
  
  // 更新默认配置
  imageService.updateDefaultConfig({
    backgroundColor: '#FF6B6B',
    textColor: '#000000'
  });
  
  const updatedConfig = imageService.getDefaultConfig();
  console.log('Updated config:', updatedConfig);
  
  console.log('✓ Config management test completed');
}

// 导出测试函数供外部调用
export { testImageGeneration, testConfigManagement };

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中，可以通过控制台调用测试
  window.testImageService = async () => {
    testConfigManagement();
    await testImageGeneration();
  };
  
  console.log('ImageService test functions loaded. Call window.testImageService() to run tests.');
}