// Script loaded
console.log('Lark Quote Converter loaded');

// Listen for copy events
document.addEventListener('copy', handleCopy);
document.addEventListener('cut', handleCopy);

// Also try listening in capture phase
document.addEventListener('copy', handleCopy, true);

// Listen for keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
    console.log('Copy shortcut detected');
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      // Process selected text
      setTimeout(() => {
        // Delay processing to let default copy happen first
        const convertedText = convertSmartQuotes(selectedText);
        if (convertedText !== selectedText) {
          tryModernClipboardAPI(convertedText);
        }
      }, 100);
    }
  }
});

function handleCopy(e) {
  console.log('Copy event triggered');
  // Get selected text
  const selectedText = window.getSelection().toString();
  console.log('Selected text:', selectedText);
  
  if (selectedText) {
    // Convert smart quotes to standard quotes
    const convertedText = convertSmartQuotes(selectedText);
    console.log('Converted text:', convertedText);
    
    // If text has changed, modify clipboard content
    if (convertedText !== selectedText) {
      try {
        console.log('Attempting to update clipboard with converted text:', convertedText);
        // Try using standard method
        e.clipboardData.setData('text/plain', convertedText);
        e.preventDefault(); // Prevent default copy behavior
      } catch (error) {
        console.error('Failed to use clipboardData.setData:', error);
        // Try using modern Clipboard API
        tryModernClipboardAPI(convertedText);
      }
    }
  }
}

// Use modern Clipboard API
async function tryModernClipboardAPI(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      console.log('Successfully wrote text using navigator.clipboard');
    } else {
      console.warn('navigator.clipboard API not available');
      // Consider using other fallback methods
      tryFallbackMethod(text);
    }
  } catch (error) {
    console.error('Failed to use navigator.clipboard:', error);
    tryFallbackMethod(text);
  }
}

// Fallback method: create temporary element and execute copy
function tryFallbackMethod(text) {
  try {
    // Create temporary textarea
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Ensure element is not visible
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    // Select and copy
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    
    // Cleanup
    document.body.removeChild(textArea);
    
    if (successful) {
      console.log('Successfully copied text using execCommand');
    } else {
      console.warn('execCommand copy failed');
    }
  } catch (error) {
    console.error('Fallback copy method failed:', error);
  }
}

/**
 * Convert smart quotes to standard quotes
 * @param {string} text - Text to convert
 * @return {string} - Converted text
 */
function convertSmartQuotes(text) {
  return text
    // Convert smart single quotes
    .replace(/[\u2018\u2019]/g, "'")
    // Convert smart double quotes
    .replace(/[\u201C\u201D]/g, '"')
    // Add other special character conversions
    .replace(/[\u2013\u2014]/g, '-'); // Convert em/en dashes to hyphens
}

// Monitor DOM changes to detect selection
const observer = new MutationObserver(function(mutations) {
  // When DOM changes, check if text is selected
  const selectedText = window.getSelection().toString();
  if (selectedText && selectedText.length > 0) {
    console.log('Text selection detected via MutationObserver:', selectedText);
  }
});

// Start observing document
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true
}); 