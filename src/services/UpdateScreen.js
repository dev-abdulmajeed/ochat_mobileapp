import { StyleSheet, Text, View, TouchableOpacity, Linking, ActivityIndicator, Platform } from 'react-native'
import React, { useState } from 'react'

const UpdateScreen = () => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [progress, setProgress] = useState(0)

  const appStoreUrl = Platform.select({
    ios: 'https://apps.apple.com/app/id1234567890',
    android: 'https://play.google.com/store/apps/details?id=com.yourapp.name',
  })

  const handleUpdateNow = async () => {
    setIsUpdating(true)
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + Math.random() * 30
      })
    }, 500)

    // After delay, redirect to app store
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      if (appStoreUrl) {
        Linking.openURL(appStoreUrl).catch(() => {
          alert('Unable to open app store. Please update manually.')
          setIsUpdating(false)
          setProgress(0)
        })
      }
    }, 2500)
  }

  const handleUpdateLater = () => {
    setIsUpdating(false)
    setProgress(0)
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
      
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>▲</Text>
          </View>
          <Text style={styles.mainTitle}>App Update Available</Text>
          <Text style={styles.description}>
            A new version is ready to enhance your experience
          </Text>
        </View>

        <View style={styles.versionCard}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Current Version</Text>
            <Text style={styles.versionValue}>2.4.1</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Latest Version</Text>
            <Text style={styles.versionValueNew}>2.5.0</Text>
          </View>
        </View>

        <View style={styles.updatesContainer}>
          <Text style={styles.updatesTitle}>What's New</Text>
          
          <View style={styles.updateItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <View style={styles.updateTextContainer}>
              <Text style={styles.updateItemTitle}>Performance Enhancement</Text>
              <Text style={styles.updateItemDesc}>30% faster app launch and navigation</Text>
            </View>
          </View>

          <View style={styles.updateItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <View style={styles.updateTextContainer}>
              <Text style={styles.updateItemTitle}>Security Updates</Text>
              <Text style={styles.updateItemDesc}>Critical patches and vulnerability fixes</Text>
            </View>
          </View>

          <View style={styles.updateItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <View style={styles.updateTextContainer}>
              <Text style={styles.updateItemTitle}>UI Improvements</Text>
              <Text style={styles.updateItemDesc}>Refined interface for better usability</Text>
            </View>
          </View>

          <View style={styles.updateItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <View style={styles.updateTextContainer}>
              <Text style={styles.updateItemTitle}>Bug Fixes</Text>
              <Text style={styles.updateItemDesc}>Resolved reported issues and stability improvements</Text>
            </View>
          </View>
        </View>

        {isUpdating && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Redirecting to App Store</Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressHint}>
              {progress < 100 ? 'Preparing...' : 'Opening App Store'}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.laterButton]}
            onPress={handleUpdateLater}
            disabled={isUpdating}
          >
            <Text style={styles.laterButtonText}>
              {isUpdating ? 'Processing...' : 'Remind Me Later'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.updateButton, isUpdating && styles.updatingButton]}
            onPress={handleUpdateNow}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>Update Now</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Updating ensures you have the latest features, security patches, and improvements
        </Text>
      </View>
    </View>
  )
}

export default UpdateScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  versionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 28,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  versionLabel: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  versionValue: {
    fontSize: 15,
    color: '#4a5568',
    fontWeight: '600',
  },
  versionValueNew: {
    fontSize: 15,
    color: '#2ecc71',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  updatesContainer: {
    marginBottom: 28,
  },
  updatesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 16,
  },
  updateItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e6f7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  checkmarkText: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  updateTextContainer: {
    flex: 1,
  },
  updateItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 4,
  },
  updateItemDesc: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
  },
  progressContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bee3f8',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a365d',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976d2',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#bee3f8',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1976d2',
    borderRadius: 3,
  },
  progressHint: {
    fontSize: 12,
    color: '#4299e1',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  laterButton: {
    backgroundColor: '#f7fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e0',
  },
  laterButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a5568',
  },
  updateButton: {
    backgroundColor: '#1976d2',
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  updatingButton: {
    opacity: 0.85,
  },
  footer: {
    fontSize: 12,
    color: '#a0aec0',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
})