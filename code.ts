// Type declarations for Figma plugin environment
declare function btoa(str: string): string;

figma.showUI(__html__, {
  width: 500,
  height: 700,
  themeColors: true
});

// Debug mode - Set to false for production
const DEBUG_MODE = false;

// Helper function to send logs to UI (only in debug mode)
function sendLog(message: string, type: string = 'info') {
  if (!DEBUG_MODE) return;
  
  figma.ui.postMessage({
    type: 'log',
    message: message,
    logType: type
  });
  console.log(`[${type}]`, message);
}

// Network request helper
async function makeRequest(url: string, options: any): Promise<any> {
  sendLog(`Making ${options.method || 'GET'} request to ${url}`);

  try {
    const response = await fetch(url, options);
    sendLog(`Response status: ${response.status}`);

    const responseText = await response.text();

    if (response.ok) {
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          return { ok: true, status: response.status, data: data };
        } catch (e) {
          return { ok: true, status: response.status, data: responseText };
        }
      }
      return { ok: true, status: response.status, data: null };
    } else {
      return { ok: false, status: response.status, error: responseText };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Network request failed';
    sendLog(`Request failed: ${errorMessage}`, 'error');
    throw error;
  }
}

// Base64 encode function
function encodeBase64(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  const utf8Bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      utf8Bytes.push(charCode);
    } else if (charCode < 0x800) {
      utf8Bytes.push(0xc0 | (charCode >> 6));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    } else if (charCode < 0x10000) {
      utf8Bytes.push(0xe0 | (charCode >> 12));
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    } else {
      utf8Bytes.push(0xf0 | (charCode >> 18));
      utf8Bytes.push(0x80 | ((charCode >> 12) & 0x3f));
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    }
  }

  for (let i = 0; i < utf8Bytes.length; i += 3) {
    const b1 = utf8Bytes[i];
    const b2 = i + 1 < utf8Bytes.length ? utf8Bytes[i + 1] : 0;
    const b3 = i + 2 < utf8Bytes.length ? utf8Bytes[i + 2] : 0;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    const enc3 = ((b2 & 15) << 2) | (b3 >> 6);
    const enc4 = b3 & 63;

    output += chars.charAt(enc1);
    output += chars.charAt(enc2);
    output += i + 1 < utf8Bytes.length ? chars.charAt(enc3) : '=';
    output += i + 2 < utf8Bytes.length ? chars.charAt(enc4) : '=';
  }

  return output;
}

// Escape XML special characters
function escapeXML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

// Escape iOS strings special characters
function escapeIOSString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Default language mapping - Users can customize in code if needed
const DEFAULT_LANGUAGE_MAP: { [key: string]: string } = {
  'English': 'en',
  'Arabic': 'ar',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Russian': 'ru',
  'Chinese': 'zh',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Dutch': 'nl',
  'Polish': 'pl',
  'Turkish': 'tr',
  'Swedish': 'sv',
  'Norwegian': 'no',
  'Danish': 'da',
  'Finnish': 'fi',
  'Greek': 'el',
  'Hebrew': 'he',
  'Hindi': 'hi',
  'Thai': 'th',
  'Vietnamese': 'vi',
  'Indonesian': 'id',
  'Malay': 'ms',
  'Czech': 'cs',
  'Hungarian': 'hu',
  'Romanian': 'ro',
  'Ukrainian': 'uk'
};

// Parse variables to Android XML format
function parseVariablesToAndroidXML(collections: any[]): { [lang: string]: string } {
  const xmlByLanguage: { [lang: string]: string } = {};

  collections.forEach(collection => {
    const modeMap: { [modeId: string]: string } = {};
    collection.modes.forEach((mode: any) => {
      modeMap[mode.modeId] = DEFAULT_LANGUAGE_MAP[mode.name] || mode.name.toLowerCase().substring(0, 2);
    });

    const stringsByLanguage: { [lang: string]: { [key: string]: string } } = {};

    collection.variables.forEach((variable: any) => {
      if (variable.type !== 'STRING') return;

      const varName = variable.name;

      Object.entries(variable.values).forEach(([modeId, value]) => {
        const langCode = modeMap[modeId];

        if (!stringsByLanguage[langCode]) {
          stringsByLanguage[langCode] = {};
        }

        stringsByLanguage[langCode][varName] = value as string;
      });
    });

    Object.entries(stringsByLanguage).forEach(([langCode, strings]) => {
      let xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';

      Object.entries(strings).forEach(([key, value]) => {
        const escapedValue = escapeXML(value);
        xml += `    <string name="${key}">${escapedValue}</string>\n`;
      });

      xml += '</resources>';
      xmlByLanguage[langCode] = xml;
    });
  });

  return xmlByLanguage;
}

// Parse variables to iOS Strings format
function parseVariablesToIOSStrings(collections: any[]): { [lang: string]: string } {
  const stringsByLanguage: { [lang: string]: string } = {};

  collections.forEach(collection => {
    const modeMap: { [modeId: string]: string } = {};
    collection.modes.forEach((mode: any) => {
      modeMap[mode.modeId] = DEFAULT_LANGUAGE_MAP[mode.name] || mode.name.toLowerCase().substring(0, 2);
    });

    const stringsData: { [lang: string]: { [key: string]: string } } = {};

    collection.variables.forEach((variable: any) => {
      if (variable.type !== 'STRING') return;

      const varName = variable.name;

      Object.entries(variable.values).forEach(([modeId, value]) => {
        const langCode = modeMap[modeId];

        if (!stringsData[langCode]) {
          stringsData[langCode] = {};
        }

        stringsData[langCode][varName] = value as string;
      });
    });

    Object.entries(stringsData).forEach(([langCode, strings]) => {
      let content = '/* Localization strings generated from Figma */\n\n';

      Object.entries(strings).forEach(([key, value]) => {
        const escapedValue = escapeIOSString(value);
        content += `"${key}" = "${escapedValue}";\n`;
      });

      stringsByLanguage[langCode] = content;
    });
  });

  return stringsByLanguage;
}

// Load saved settings with version
figma.clientStorage.getAsync('github-settings-v2').then((settings: any) => {
  figma.ui.postMessage({ type: 'load-settings', settings: settings || {} });
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Failed to load settings');
});

// Main message handler
figma.ui.onmessage = async (msg: any) => {
  if (DEBUG_MODE) {
    console.log('Received message:', msg.type);
  }

  // Save settings
  if (msg.type === 'save-settings' && msg.settings) {
    await figma.clientStorage.setAsync('github-settings-v2', msg.settings);
    figma.ui.postMessage({ type: 'settings-saved' });
  }

  // Export variables
  if (msg.type === 'export-variables') {
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();

      if (collections.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'No variable collections found.' });
        return;
      }

      const exportData: any[] = [];

      for (const collection of collections) {
        const stringVariables: any[] = [];

        for (const variableId of collection.variableIds) {
          const variable = await figma.variables.getVariableByIdAsync(variableId);

          if (variable && variable.resolvedType === 'STRING') {
            const variableData: any = {
              id: variable.id,
              name: variable.name,
              description: variable.description || '',
              type: variable.resolvedType,
              values: {}
            };

            for (const modeId in variable.valuesByMode) {
              if (Object.prototype.hasOwnProperty.call(variable.valuesByMode, modeId)) {
                variableData.values[modeId] = variable.valuesByMode[modeId];
              }
            }

            stringVariables.push(variableData);
          }
        }

        if (stringVariables.length > 0) {
          const collectionData: any = {
            id: collection.id,
            name: collection.name,
            modes: collection.modes.map((mode) => ({
              name: mode.name,
              modeId: mode.modeId
            })),
            variables: stringVariables
          };

          exportData.push(collectionData);
        }
      }

      if (exportData.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'No STRING variables found.' });
        return;
      }

      const totalStrings = exportData.reduce((sum, col) => sum + col.variables.length, 0);
      const totalLanguages = exportData[0]?.modes.length || 0;

      figma.ui.postMessage({
        type: 'variables-data',
        data: exportData,
        stats: {
          collections: exportData.length,
          strings: totalStrings,
          languages: totalLanguages,
          collectionNames: exportData.map(c => c.name)
        }
      });

      figma.notify(`✅ Loaded ${totalStrings} strings in ${totalLanguages} languages`);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      figma.ui.postMessage({ type: 'error', message: `Error: ${errorMessage}` });
    }
  }

  // Test GitHub Connection
  if (msg.type === 'test-github') {
    sendLog('Backend: Testing GitHub connection...');

    try {
      const { username, repo, token } = msg.settings;
      const url = `https://api.github.com/repos/${username}/${repo}`;

      const response = await makeRequest(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (response.ok) {
        const data = response.data;
        sendLog(`Backend: Success! Repository: ${data.full_name}`, 'success');

        figma.ui.postMessage({
          type: 'test-success',
          data: {
            fullName: data.full_name,
            private: data.private,
            defaultBranch: data.default_branch
          }
        });

        figma.notify('✅ GitHub connection successful!');
      } else {
        sendLog(`Backend: HTTP ${response.status}`, 'error');
        figma.ui.postMessage({ type: 'test-error', message: `HTTP ${response.status}: Check your token and repository access` });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendLog(`Backend: Exception: ${errorMessage}`, 'error');
      figma.ui.postMessage({ type: 'test-error', message: `Connection failed: ${errorMessage}` });
    }
  }

  // Upload to GitHub with PR
  if (msg.type === 'upload-github') {
    sendLog('Backend: Starting PR creation workflow...');
    figma.notify('🚀 Creating branch and PR...');

    try {
      const { username, repo, baseBranch, token, commitMessage, variablesData, platforms, filePaths, branchName, prTitle, prTemplate } = msg.data;

      if (!variablesData || !Array.isArray(variablesData) || variablesData.length === 0) {
        throw new Error('Invalid variables data received');
      }

      if (!platforms || (!platforms.android && !platforms.ios)) {
        throw new Error('At least one platform (Android or iOS) must be selected');
      }

      const targetBranch = branchName || 'localization';

      sendLog(`Backend: Repo: ${username}/${repo}`);
      sendLog(`Backend: Base: ${baseBranch} → Branch: ${targetBranch}`);
      sendLog(`Backend: Platforms: ${platforms.android ? 'Android' : ''} ${platforms.ios ? 'iOS' : ''}`);

      // Step 1: Parse to formats
      sendLog('Step 1: Parsing to localization formats...');
      const androidXML = platforms.android ? parseVariablesToAndroidXML(variablesData) : {};
      const iosStrings = platforms.ios ? parseVariablesToIOSStrings(variablesData) : {};
      
      const languages = Object.keys(platforms.android ? androidXML : iosStrings);
      sendLog(`Backend: Generated for ${languages.length} languages: ${languages.join(', ')}`);

      // Step 2: Get base branch reference
      sendLog('Step 2: Getting base branch reference...');
      const baseRefUrl = `https://api.github.com/repos/${username}/${repo}/git/ref/heads/${baseBranch}`;
      const baseRefResponse = await makeRequest(baseRefUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!baseRefResponse.ok) {
        throw new Error(`Failed to get base branch '${baseBranch}'. Make sure the branch exists.`);
      }

      const baseSha = baseRefResponse.data.object.sha;
      sendLog(`Backend: Base SHA: ${baseSha.substring(0, 7)}`);

      // Step 3: Create or reset branch
      sendLog('Step 3: Creating/resetting branch...');
      const branchRefUrl = `https://api.github.com/repos/${username}/${repo}/git/refs/heads/${targetBranch}`;

      // Try to delete existing branch first (ignore errors)
      await makeRequest(branchRefUrl, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      // Create fresh branch
      const createRefUrl = `https://api.github.com/repos/${username}/${repo}/git/refs`;
      const createResponse = await makeRequest(createRefUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: `refs/heads/${targetBranch}`,
          sha: baseSha
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create branch '${targetBranch}': ${createResponse.error}`);
      }

      sendLog('Backend: Branch ready!');

      // Step 4: Update Android files
      if (platforms.android) {
        sendLog('Step 4a: Updating Android files...');
        for (const [langCode, xmlContent] of Object.entries(androidXML)) {
          const valuesDir = langCode === 'en' ? 'values' : `values-${langCode}`;
          const filePath = filePaths.android.replace('{lang}', valuesDir);

          sendLog(`Backend: Updating ${filePath}...`);

          const fileUrl = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}?ref=${targetBranch}`;
          const fileResponse = await makeRequest(fileUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `token ${token}`,
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

          const fileSha = fileResponse.ok ? fileResponse.data.sha : undefined;

          const updateFileUrl = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
          const base64Content = encodeBase64(xmlContent);

          const updateFileResponse = await makeRequest(updateFileUrl, {
            method: 'PUT',
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `token ${token}`,
              'X-GitHub-Api-Version': '2022-11-28',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: commitMessage,
              content: base64Content,
              branch: targetBranch,
              ...(fileSha && { sha: fileSha })
            })
          });

          if (!updateFileResponse.ok) {
            const errorDetail = JSON.parse(updateFileResponse.error);
            if (errorDetail.message && errorDetail.message.includes('does not exist')) {
              throw new Error(`Path '${filePath}' does not exist. Please create the folder structure first.`);
            }
            throw new Error(`Failed to update ${filePath}: ${updateFileResponse.error}`);
          }

          sendLog(`Backend: ✓ Updated Android ${langCode}`);
        }
      }

      // Step 4b: Update iOS files
      if (platforms.ios) {
        sendLog('Step 4b: Updating iOS files...');
        for (const [langCode, stringsContent] of Object.entries(iosStrings)) {
          const langDir = langCode === 'en' ? 'Base' : `${langCode}`;
          const filePath = filePaths.ios.replace('{lang}', langDir);

          sendLog(`Backend: Updating ${filePath}...`);

          const fileUrl = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}?ref=${targetBranch}`;
          const fileResponse = await makeRequest(fileUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `token ${token}`,
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

          const fileSha = fileResponse.ok ? fileResponse.data.sha : undefined;

          const updateFileUrl = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
          const base64Content = encodeBase64(stringsContent);

          const updateFileResponse = await makeRequest(updateFileUrl, {
            method: 'PUT',
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `token ${token}`,
              'X-GitHub-Api-Version': '2022-11-28',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: commitMessage,
              content: base64Content,
              branch: targetBranch,
              ...(fileSha && { sha: fileSha })
            })
          });

          if (!updateFileResponse.ok) {
            const errorDetail = JSON.parse(updateFileResponse.error);
            if (errorDetail.message && errorDetail.message.includes('does not exist')) {
              throw new Error(`Path '${filePath}' does not exist. Please create the folder structure first.`);
            }
            throw new Error(`Failed to update ${filePath}: ${updateFileResponse.error}`);
          }

          sendLog(`Backend: ✓ Updated iOS ${langCode}`);
        }
      }

      // Step 5: Create PR
      sendLog('Step 5: Creating pull request...');
      
      const platformsList = [];
      if (platforms.android) platformsList.push('Android');
      if (platforms.ios) platformsList.push('iOS');
      
      // Use custom PR title or default
      const finalPrTitle = prTitle || '🌐 Update Localization Strings from Figma';
      
      // Build PR body based on template or use default
      let prBody = '';
      if (prTemplate === 'detailed') {
        prBody = `## 🌐 Automated Localization Update

**Generated from Figma Variables**

### 📊 Summary
- **Platforms:** ${platformsList.join(', ')}
- **Languages:** ${languages.join(', ')}
- **Total Strings:** Updated across all languages

### 📝 Updated Files
${platforms.android ? `#### Android\n${languages.map(lang => {
          const valuesDir = lang === 'en' ? 'values' : `values-${lang}`;
          return `- \`${filePaths.android.replace('{lang}', valuesDir)}\``;
        }).join('\n')}\n` : ''}${platforms.ios ? `#### iOS\n${languages.map(lang => {
          const langDir = lang === 'en' ? 'Base' : `${lang}`;
          return `- \`${filePaths.ios.replace('{lang}', langDir)}\``;
        }).join('\n')}` : ''}

### 🔄 Changes
This PR updates localization strings to match the latest Figma Variables.

---
*Automatically generated by Figma Localization Exporter*`;
      } else {
        // Simple template
        prBody = `Updated localization strings from Figma.\n\n**Platforms:** ${platformsList.join(', ')}\n**Languages:** ${languages.join(', ')}`;
      }
      
      const prUrl = `https://api.github.com/repos/${username}/${repo}/pulls`;
      const prPayload = {
        title: finalPrTitle,
        body: prBody,
        head: targetBranch,
        base: baseBranch
      };

      const prResponse = await makeRequest(prUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prPayload)
      });

      if (prResponse.ok) {
        const prData = prResponse.data;
        sendLog(`Backend: PR #${prData.number} created!`, 'success');

        figma.ui.postMessage({
          type: 'upload-success',
          data: {
            prNumber: prData.number,
            prUrl: prData.html_url,
            languages: languages,
            platforms: platformsList
          }
        });

        figma.notify(`🎉 PR #${prData.number} created!`, { timeout: 5000 });
      } else if (prResponse.status === 422) {
        sendLog('Backend: PR already exists', 'info');
        figma.ui.postMessage({
          type: 'upload-success',
          data: { message: 'Files updated. PR already exists.', languages: languages, platforms: platformsList }
        });
        figma.notify('✅ Files updated!', { timeout: 3000 });
      } else {
        throw new Error(`PR creation failed: ${prResponse.error}`);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendLog(`Backend: Error: ${errorMessage}`, 'error');
      figma.ui.postMessage({ type: 'upload-error', message: errorMessage });
      figma.notify(`❌ ${errorMessage}`, { error: true });
    }
  }

  if (msg.type === 'notify' && msg.message) {
    figma.notify(msg.message, { timeout: msg.timeout || 3000 });
  }
};
