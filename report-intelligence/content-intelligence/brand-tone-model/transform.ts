/**
 * Brand Tone Model Transformation
 * 
 * Content transformation to match brand tone guidelines
 */

import {
  BrandToneProfile,
  ToneTransformation,
} from './types';

import {
  tokenise,
  extractSentences,
  normaliseText,
} from './utils';

export class BrandToneTransformer {
  /**
   * Apply brand tone to content
   */
  applyToneToContent(content: string, profile: BrandToneProfile): ToneTransformation {
    const sentences = extractSentences(content);
    const transformedSentences: string[] = [];
    const changes: Array<{
      type: 'vocabulary' | 'sentence-structure' | 'formality' | 'emotion' | 'pacing';
      original: string;
      replacement: string;
      reason: string;
    }> = [];

    for (const sentence of sentences) {
      let transformed = sentence;
      
      // Adjust vocabulary
      transformed = this.adjustVocabulary(transformed, profile);
      if (transformed !== sentence) {
        changes.push({
          type: 'vocabulary',
          original: sentence,
          replacement: transformed,
          reason: 'Adjusted vocabulary to match brand level',
        });
      }

      // Adjust sentence structure
      const structureAdjusted = this.adjustSentenceStructure(transformed, profile);
      if (structureAdjusted !== transformed) {
        changes.push({
          type: 'sentence-structure',
          original: transformed,
          replacement: structureAdjusted,
          reason: 'Adjusted sentence structure for brand pacing',
        });
        transformed = structureAdjusted;
      }

      // Adjust formality
      const formalityAdjusted = this.adjustFormality(transformed, profile);
      if (formalityAdjusted !== transformed) {
        changes.push({
          type: 'formality',
          original: transformed,
          replacement: formalityAdjusted,
          reason: 'Adjusted formality level',
        });
        transformed = formalityAdjusted;
      }

      // Adjust emotion
      const emotionAdjusted = this.adjustEmotion(transformed, profile);
      if (emotionAdjusted !== transformed) {
        changes.push({
          type: 'emotion',
          original: transformed,
          replacement: emotionAdjusted,
          reason: 'Adjusted emotional tone',
        });
        transformed = emotionAdjusted;
      }

      transformedSentences.push(transformed);
    }

    const transformedContent = transformedSentences.join(' ');
    const confidence = this.calculateTransformationConfidence(content, transformedContent, profile);

    return {
      original: content,
      transformed: transformedContent,
      changes,
      confidence,
    };
  }

  /**
   * Adjust sentence structure for brand pacing
   */
  adjustSentenceStructure(sentence: string, profile: BrandToneProfile): string {
    const tokens = tokenise(sentence);
    
    if (profile.sentenceLength === 'short' && tokens.length > 15) {
      // Split long sentences for short-sentence brands
      const midpoint = Math.floor(tokens.length / 2);
      const firstHalf = tokens.slice(0, midpoint).join(' ');
      const secondHalf = tokens.slice(midpoint).join(' ');
      return `${firstHalf}. ${secondHalf.charAt(0).toUpperCase()}${secondHalf.slice(1)}.`;
    } else if (profile.sentenceLength === 'long' && tokens.length < 8) {
      // For long-sentence brands, we might combine with next sentence
      // but that requires context beyond single sentence
      // For now, just return as-is
      return sentence;
    }
    
    return sentence;
  }

  /**
   * Adjust vocabulary level
   */
  adjustVocabulary(sentence: string, profile: BrandToneProfile): string {
    const vocabularyMap: Record<string, Record<string, string>> = {
      'basic': {
        'utilize': 'use',
        'facilitate': 'help',
        'implement': 'put in place',
        'optimize': 'make better',
        'leverage': 'use',
        'approximately': 'about',
        'subsequently': 'later',
        'consequently': 'so',
        'nevertheless': 'but',
        'furthermore': 'also',
        'moreover': 'also',
        'therefore': 'so',
        'however': 'but',
        'accordingly': 'so',
        'henceforth': 'from now on',
        'endeavor': 'try',
        'ascertain': 'find out',
        'elucidate': 'explain',
        'delineate': 'describe',
        'explicate': 'explain',
      },
      'advanced': {
        'use': 'utilize',
        'help': 'facilitate',
        'put in place': 'implement',
        'make better': 'optimize',
        'simple': 'straightforward',
        'easy': 'straightforward',
        'hard': 'challenging',
        'big': 'substantial',
        'small': 'modest',
        'good': 'effective',
        'bad': 'ineffective',
        'fast': 'efficient',
        'slow': 'deliberate',
        'old': 'established',
        'new': 'innovative',
        'cheap': 'cost-effective',
        'expensive': 'premium',
      },
    };

    let adjusted = sentence;
    const targetLevel = profile.vocabularyLevel;
    
    if (targetLevel === 'basic') {
      for (const [complex, simple] of Object.entries(vocabularyMap.basic)) {
        const regex = new RegExp(`\\b${complex}\\b`, 'gi');
        adjusted = adjusted.replace(regex, simple);
      }
    } else if (targetLevel === 'advanced') {
      for (const [simple, complex] of Object.entries(vocabularyMap.advanced)) {
        const regex = new RegExp(`\\b${simple}\\b`, 'gi');
        adjusted = adjusted.replace(regex, complex);
      }
    }

    return adjusted;
  }

  /**
   * Adjust formality level
   */
  adjustFormality(sentence: string, profile: BrandToneProfile): string {
    const formalityMap: Record<string, Record<string, string>> = {
      'formal': {
        "can't": 'cannot',
        "won't": 'will not',
        "don't": 'do not',
        "isn't": 'is not',
        "aren't": 'are not',
        "wasn't": 'was not',
        "weren't": 'were not',
        "haven't": 'have not',
        "hasn't": 'has not',
        "hadn't": 'had not',
        "wouldn't": 'would not',
        "couldn't": 'could not',
        "shouldn't": 'should not',
        "mightn't": 'might not',
        "mustn't": 'must not',
        "it's": 'it is',
        "that's": 'that is',
        "what's": 'what is',
        "who's": 'who is',
        "where's": 'where is',
        "i'm": 'I am',
        "you're": 'you are',
        "he's": 'he is',
        "she's": 'she is',
        "we're": 'we are',
        "they're": 'they are',
        'get': 'obtain',
        'buy': 'purchase',
        'help': 'assist',
        'start': 'commence',
        'stop': 'cease',
        'use': 'utilize',
        'need': 'require',
        'want': 'desire',
        'like': 'appreciate',
        'hate': 'dislike',
        'tell': 'inform',
        'ask': 'inquire',
        'show': 'demonstrate',
        'try': 'attempt',
        'fix': 'repair',
        'break': 'damage',
      },
      'casual': {
        'cannot': "can't",
        'will not': "won't",
        'do not': "don't",
        'is not': "isn't",
        'are not': "aren't",
        'was not': "wasn't",
        'were not': "weren't",
        'have not': "haven't",
        'has not': "hasn't",
        'had not': "hadn't",
        'would not': "wouldn't",
        'could not': "couldn't",
        'should not': "shouldn't",
        'might not': "mightn't",
        'must not': "mustn't",
        'it is': "it's",
        'that is': "that's",
        'what is': "what's",
        'who is': "who's",
        'where is': "where's",
        'I am': "I'm",
        'you are': "you're",
        'he is': "he's",
        'she is': "she's",
        'we are': "we're",
        'they are': "they're",
        'obtain': 'get',
        'purchase': 'buy',
        'assist': 'help',
        'commence': 'start',
        'cease': 'stop',
        'utilize': 'use',
        'require': 'need',
        'desire': 'want',
        'appreciate': 'like',
        'dislike': 'hate',
        'inform': 'tell',
        'inquire': 'ask',
        'demonstrate': 'show',
        'attempt': 'try',
        'repair': 'fix',
        'damage': 'break',
      },
    };

    let adjusted = sentence;
    const targetFormality = profile.formality;
    
    if (targetFormality === 'formal') {
      for (const [informal, formal] of Object.entries(formalityMap.formal)) {
        const regex = new RegExp(`\\b${informal}\\b`, 'gi');
        adjusted = adjusted.replace(regex, formal);
      }
    } else if (targetFormality === 'casual') {
      for (const [formal, informal] of Object.entries(formalityMap.casual)) {
        const regex = new RegExp(`\\b${formal}\\b`, 'gi');
        adjusted = adjusted.replace(regex, informal);
      }
    }

    return adjusted;
  }

  /**
   * Adjust emotional tone
   */
  adjustEmotion(sentence: string, profile: BrandToneProfile): string {
    const emotionMap: Record<string, Record<string, string>> = {
      'positive': {
        'bad': 'challenging',
        'problem': 'opportunity',
        'difficult': 'engaging',
        'hard': 'rewarding',
        'failure': 'learning experience',
        'mistake': 'growth opportunity',
        'issue': 'matter',
        'concern': 'consideration',
        'worry': 'consider',
        'fear': 'awareness',
        'hate': 'prefer differently',
        'dislike': 'have a preference for something else',
      },
      'serious': {
        'fun': 'engaging',
        'exciting': 'significant',
        'awesome': 'impressive',
        'cool': 'effective',
        'great': 'substantial',
        'amazing': 'notable',
        'fantastic': 'commendable',
        'wonderful': 'valuable',
        'happy': 'satisfied',
        'joyful': 'content',
        'delighted': 'pleased',
      },
      'enthusiastic': {
        'good': 'great',
        'nice': 'wonderful',
        'okay': 'fantastic',
        'fine': 'excellent',
        'adequate': 'superb',
        'satisfactory': 'outstanding',
        'acceptable': 'remarkable',
        'decent': 'impressive',
        'average': 'above average',
        'standard': 'exceptional',
      },
      'neutral': {
        'great': 'good',
        'amazing': 'notable',
        'fantastic': 'effective',
        'wonderful': 'satisfactory',
        'awesome': 'competent',
        'excellent': 'adequate',
        'outstanding': 'sufficient',
        'remarkable': 'acceptable',
        'impressive': 'standard',
        'superb': 'decent',
      },
    };

    let adjusted = sentence;
    const targetEmotion = profile.emotion;
    
    if (emotionMap[targetEmotion]) {
      for (const [source, target] of Object.entries(emotionMap[targetEmotion])) {
        const regex = new RegExp(`\\b${source}\\b`, 'gi');
        adjusted = adjusted.replace(regex, target);
      }
    }

    // Add emotional markers for enthusiastic tone
    if (targetEmotion === 'enthusiastic') {
      if (!adjusted.endsWith('!') && !adjusted.endsWith('?')) {
        adjusted = adjusted.replace(/\.$/, '!');
      }
      
      // Add enthusiastic phrases
      const enthusiasticPhrases = [
        'Absolutely! ',
        'Without a doubt, ',
        'It\'s incredible that ',
        'We\'re thrilled that ',
        'It\'s amazing how ',
      ];
      
      // Occasionally add enthusiastic opener
      if (Math.random() > 0.7) {
        const phrase = enthusiasticPhrases[Math.floor(Math.random() * enthusiasticPhrases.length)];
        adjusted = phrase + adjusted.charAt(0).toLowerCase() + adjusted.slice(1);
      }
    }

    // Remove emotional markers for serious tone
    if (targetEmotion === 'serious') {
      adjusted = adjusted.replace(/!/g, '.');
      adjusted = adjusted.replace(/\b(Absolutely|Without a doubt|It\'s incredible|We\'re thrilled|It\'s amazing)\b/gi, '');
    }

    return adjusted;
  }

  /**
   * Calculate transformation confidence (0-1)
   */
  calculateTransformationConfidence(
    original: string,
    transformed: string,
    profile: BrandToneProfile
  ): number {
    if (original === transformed) {
      return 1.0; // No changes needed, perfect confidence
    }

    const originalTokens = tokenise(original);
    const transformedTokens = tokenise(transformed);
    
    if (originalTokens.length === 0 || transformedTokens.length === 0) {
      return 0.5;
    }

    // Calculate token similarity
    const originalSet = new Set(originalTokens.map(t => t.toLowerCase()));
    const transformedSet = new Set(transformedTokens.map(t => t.toLowerCase()));
    
    const intersection = new Set([...originalSet].filter(x => transformedSet.has(x)));
    const union = new Set([...originalSet, ...transformedSet]);
    
    const tokenSimilarity = intersection.size / union.size;

    // Calculate length preservation
    const lengthRatio = Math.min(original.length, transformed.length) / Math.max(original.length, transformed.length);

    // Calculate keyword preservation
    const originalKeywords = originalTokens.filter(token => 
      (profile.keywords || []).some(keyword => 
        token.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(token.toLowerCase())
      )
    );
    
    const transformedKeywords = transformedTokens.filter(token => 
      (profile.keywords || []).some(keyword => 
        token.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(token.toLowerCase())
      )
    );
    
    const keywordPreservation = originalKeywords.length > 0 
      ? transformedKeywords.length / originalKeywords.length 
      : 1.0;

    // Combined confidence
    const confidence = (
      tokenSimilarity * 0.4 +
      lengthRatio * 0.3 +
      keywordPreservation * 0.3
    );

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Apply tone preset to content
   */
  applyTonePreset(content: string, presetId: string): string {
    // Simplified preset application
    const presetMap: Record<string, (text: string) => string> = {
      'professional-formal': (text: string) => {
        return text
          .replace(/!/g, '.')
          .replace(/\b(can't|won't|don't)\b/gi, (match) => {
            const replacements: Record<string, string> = {
              "can't": 'cannot',
              "won't": 'will not',
              "don't": 'do not',
            };
            return replacements[match.toLowerCase()] || match;
          })
          .replace(/\b(get|buy|help|start)\b/gi, (match) => {
            const replacements: Record<string, string> = {
              'get': 'obtain',
              'buy': 'purchase',
              'help': 'assist',
              'start': 'commence',
            };
            return replacements[match.toLowerCase()] || match;
          });
      },
      'educational-casual': (text: string) => {
        return text
          .replace(/\.(?=\s|$)/g, (match, offset, string) => {
            // Occasionally add enthusiastic punctuation
            return Math.random() > 0.7 ? '!' : match;
          })
          .replace(/\b(utilize|facilitate|implement)\b/gi, (match) => {
            const replacements: Record<string, string> = {
              'utilize': 'use',
              'facilitate': 'help',
              'implement': 'put in place',
            };
            return replacements[match.toLowerCase()] || match;
          });
      },
      'technical-neutral': (text: string) => {
        return text
          .replace(/\b(use|help|simple|easy)\b/gi, (match) => {
            const replacements: Record<string, string> = {
              'use': 'utilize',
              'help': 'facilitate',
              'simple': 'straightforward',
              'easy': 'straightforward',
            };
            return replacements[match.toLowerCase()] || match;
          });
      },
      'friendly-positive': (text: string) => {
        return text
          .replace(/\.(?=\s|$)/g, '!')
          .replace(/\b(problem|difficult|hard)\b/gi, (match) => {
            const replacements: Record<string, string> = {
              'problem': 'opportunity',
              'difficult': 'engaging',
              'hard': 'rewarding',
            };
            return replacements[match.toLowerCase()] || match;
          });
      },
    };

    const presetFunction = presetMap[presetId];
    if (presetFunction) {
      return presetFunction(content);
    }

    // Default: return original content
    return content;
  }
}