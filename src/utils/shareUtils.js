import { Share, Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

export const shareScanResult = async (result) => {
  const riskLevel = result.riskScore <= 20 ? 'Safe' : result.riskScore <= 50 ? 'Suspicious' : 'Scam';
  const emoji = riskLevel === 'Safe' ? '\u2705' : riskLevel === 'Suspicious' ? '\u26A0\uFE0F' : '\uD83D\uDEA8';

  const message = [
    `${emoji} JobShield Scan Result`,
    ``,
    `Company: ${result.companyName || 'Unknown'}`,
    `Position: ${result.jobTitle || 'Unknown'}`,
    `Risk Score: ${result.riskScore}/100 (${riskLevel})`,
    ``,
    result.explanation ? `Analysis: ${result.explanation.slice(0, 200)}...` : '',
    ``,
    `Scanned with JobShield - AI Job Scam Detection`,
  ].filter(Boolean).join('\n');

  try {
    const shareResult = await Share.share({
      message,
      title: `JobShield: ${result.companyName} - ${riskLevel}`,
    });
    return shareResult;
  } catch (error) {
    console.warn('Share failed:', error);
  }
};

export const shareViaWhatsApp = async (result) => {
  const riskLevel = result.riskScore <= 20 ? 'Safe' : result.riskScore <= 50 ? 'Suspicious' : 'Scam';
  const emoji = riskLevel === 'Safe' ? '\u2705' : riskLevel === 'Suspicious' ? '\u26A0\uFE0F' : '\uD83D\uDEA8';

  const message = [
    `${emoji} JobShield Scan: ${result.companyName}`,
    `Position: ${result.jobTitle}`,
    `Risk: ${result.riskScore}/100 (${riskLevel})`,
    result.explanation ? `\n${result.explanation.slice(0, 150)}...` : '',
    `\nScanned with JobShield`,
  ].filter(Boolean).join('\n');

  try {
    await Share.share({ message, title: 'JobShield Scan Result' });
  } catch (error) {
    console.warn('WhatsApp share failed:', error);
  }
};

export const copyResultToClipboard = async (result) => {
  const riskLevel = result.riskScore <= 20 ? 'Safe' : result.riskScore <= 50 ? 'Suspicious' : 'Scam';

  const text = [
    `JobShield Scan: ${result.companyName} - ${result.jobTitle}`,
    `Risk Score: ${result.riskScore}/100 (${riskLevel})`,
    result.explanation || '',
  ].filter(Boolean).join('\n');

  try {
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    try {
      await Share.share({ message: text });
    } catch {}
    return false;
  }
};
