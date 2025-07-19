interface ExtractedData {
  title?: string
  summary?: string
  source?: string
  date?: string
  tags?: string[]
}

export const extractDataFromUrl = async (url: string): Promise<ExtractedData> => {
  try {
    // Try multiple CORS proxies to avoid browser CORS issues
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/'
    ]
    
    let response: Response | null = null
    let lastError: Error | null = null
    
    for (const proxy of corsProxies) {
      try {
        const proxyUrl = proxy === 'https://cors-anywhere.herokuapp.com/' ? 
          proxy + url : 
          proxy + encodeURIComponent(url)
        
        response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        
        if (response.ok) {
          break
        }
      } catch (error) {
        lastError = error as Error
        continue
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error('Failed to fetch URL from all proxies')
    }

    const html = await response.text()
    
    // Extract data using regex patterns
    const extractedData: ExtractedData = {}

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      extractedData.title = titleMatch[1].trim()
    }

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    if (descMatch) {
      extractedData.summary = descMatch[1].trim()
    }

    // Extract Open Graph title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    if (ogTitleMatch && !extractedData.title) {
      extractedData.title = ogTitleMatch[1].trim()
    }

    // Extract Open Graph description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    if (ogDescMatch && !extractedData.summary) {
      extractedData.summary = ogDescMatch[1].trim()
    }

    // Extract publication date
    const dateMatch = html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*name=["']date["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<time[^>]*datetime=["']([^"']+)["']/i)
    
    if (dateMatch) {
      const date = new Date(dateMatch[1])
      if (!isNaN(date.getTime())) {
        extractedData.date = date.toISOString().split('T')[0]
      }
    }

    // Extract source from URL domain
    try {
      const urlObj = new URL(url)
      extractedData.source = urlObj.hostname.replace('www.', '')
    } catch (e) {
      // If URL parsing fails, try to extract from the URL string
      const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/)
      if (domainMatch) {
        extractedData.source = domainMatch[1]
      }
    }

    // Extract tags/keywords
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i)
    if (keywordsMatch) {
      extractedData.tags = keywordsMatch[1].split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }

    // If no tags found, try to extract from article tags
    if (!extractedData.tags || extractedData.tags.length === 0) {
      const tagMatches = html.match(/<a[^>]*class=["'][^"']*tag[^"']*["'][^>]*>([^<]+)<\/a>/gi)
      if (tagMatches) {
        extractedData.tags = tagMatches.map(tag => {
          const textMatch = tag.match(/>([^<]+)</)
          return textMatch ? textMatch[1].trim() : ''
        }).filter(tag => tag.length > 0)
      }
    }

    // If still no tags, try to extract from article categories
    if (!extractedData.tags || extractedData.tags.length === 0) {
      const categoryMatches = html.match(/<a[^>]*class=["'][^"']*category[^"']*["'][^>]*>([^<]+)<\/a>/gi)
      if (categoryMatches) {
        extractedData.tags = categoryMatches.map(cat => {
          const textMatch = cat.match(/>([^<]+)</)
          return textMatch ? textMatch[1].trim() : ''
        }).filter(cat => cat.length > 0)
      }
    }

    // Try to extract author information
    const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i)
    if (authorMatch && extractedData.tags) {
      extractedData.tags.push(authorMatch[1].trim())
    }

    // Clean up the data
    if (extractedData.title) {
      extractedData.title = extractedData.title.replace(/[^\w\s\-.,!?()]/g, '').trim()
    }
    
    if (extractedData.summary) {
      extractedData.summary = extractedData.summary.replace(/[^\w\s\-.,!?()]/g, '').trim()
      // Limit summary length
      if (extractedData.summary.length > 500) {
        extractedData.summary = extractedData.summary.substring(0, 500) + '...'
      }
    }

    return extractedData
  } catch (error) {
    console.error('Error extracting data from URL:', error)
    
    // Fallback: at least extract domain and suggest tags
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace('www.', '')
      
      // Suggest tags based on domain
      const suggestedTags: string[] = []
      if (domain.includes('thehindu')) suggestedTags.push('The Hindu', 'News')
      if (domain.includes('indianexpress')) suggestedTags.push('Indian Express', 'News')
      if (domain.includes('timesofindia')) suggestedTags.push('Times of India', 'News')
      if (domain.includes('pib')) suggestedTags.push('PIB', 'Government')
      if (domain.includes('mea')) suggestedTags.push('MEA', 'International Relations')
      if (domain.includes('isro')) suggestedTags.push('ISRO', 'Science & Technology')
      if (domain.includes('niti')) suggestedTags.push('NITI Aayog', 'Policy')
      
      return {
        source: domain,
        tags: suggestedTags
      }
    } catch (fallbackError) {
      console.error('Fallback extraction also failed:', fallbackError)
      throw error
    }
  }
} 