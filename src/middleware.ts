// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

/**
 * Next.js Middleware for handling location URL redirects
 * 
 * This middleware addresses issue #242 where old location URLs result in 404 errors
 * instead of redirecting to new URLs when organization names or locations change.
 * 
 * When a location slug is not found (404), the middleware:
 * 1. Extracts organization/location names from the old slug
 * 2. Searches for locations using those terms
 * 3. Finds the best matching location using string similarity
 * 4. Redirects with 301 status to the new location URL
 * 
 * Example redirect:
 * /locations/montefiore-medical-center-albert-einstein-wellness-center-port-morris
 * -> /locations/montefiore-einstein-port-morris (301 redirect)
 */

import { NextRequest, NextResponse } from 'next/server';

const GO_GETTA_PROD_URL = process.env.NEXT_PUBLIC_GO_GETTA_PROD_URL;

/**
 * Calculates similarity between two strings using a simple word overlap approach
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/[\s-]+/).filter(w => w.length > 2);
  const words2 = str2.toLowerCase().split(/[\s-]+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(word => words2.includes(word));
  return (commonWords.length * 2) / (words1.length + words2.length);
}

/**
 * Attempts to find a location by searching for organization/location names
 * extracted from the old slug when the direct slug lookup fails
 */
async function findLocationBySlugSearch(oldSlug: string): Promise<string | null> {
  if (!GO_GETTA_PROD_URL) {
    return null;
  }

  try {
    // Extract potential organization and location names from the slug
    // Example: "montefiore-medical-center-albert-einstein-wellness-center-port-morris"
    const slugParts = oldSlug.split('-');
    const searchTerms: string[] = [];
    
    // Try different combinations of words from the slug as search terms
    // Start with longer combinations (more specific) and work down
    for (let i = Math.min(6, slugParts.length); i >= 2; i--) {
      const orgNameParts = slugParts.slice(0, i);
      searchTerms.push(orgNameParts.join(' '));
    }
    
    // Also try searching with key individual words (longer than 3 chars)
    for (const part of slugParts) {
      if (part.length > 3) {
        searchTerms.push(part);
      }
    }

    // Search for locations using each search term (try up to 3 terms to avoid excessive API calls)
    for (let i = 0; i < Math.min(3, searchTerms.length); i++) {
      const searchTerm = searchTerms[i];
      const searchUrl = `${GO_GETTA_PROD_URL}/locations?occasion=COVID19&pageNumber=0&pageSize=20&locationFieldsOnly=true&searchString=${encodeURIComponent(searchTerm)}`;
      
      try {
        const response = await fetch(searchUrl, {
          signal: AbortSignal.timeout(3000) // 3 second timeout for each search
        });
        
        if (response.ok) {
          const locations = await response.json();
          
          if (locations && locations.length > 0) {
            // Find the best matching location by comparing slug similarity
            let bestMatch = locations[0];
            let bestSimilarity = calculateStringSimilarity(oldSlug, bestMatch.slug);
            
            for (const location of locations) {
              const similarity = calculateStringSimilarity(oldSlug, location.slug);
              if (similarity > bestSimilarity) {
                bestMatch = location;
                bestSimilarity = similarity;
              }
            }
            
            // Only return a match if it has reasonable similarity (> 0.3)
            if (bestSimilarity > 0.3) {
              return bestMatch.slug;
            }
          }
        }
      } catch (fetchError) {
        console.error(`Error searching with term "${searchTerm}":`, fetchError);
        // Continue to next search term
      }
    }
  } catch (error) {
    console.error('Error searching for location by slug:', error);
  }
  
  return null;
}

export async function middleware(request: NextRequest) {
  // Only handle requests to /locations/{slug}
  const pathname = request.nextUrl.pathname;
  const locationMatch = pathname.match(/^\/locations\/([^\/]+)$/);
  
  if (!locationMatch) {
    return NextResponse.next();
  }
  
  const slug = locationMatch[1];
  
  // Skip processing for obviously invalid slugs (too short or containing invalid characters)
  if (slug.length < 3 || /[^a-zA-Z0-9-]/.test(slug)) {
    return NextResponse.next();
  }
  
  // First, try to check if the location exists by making a head request to the API
  if (GO_GETTA_PROD_URL) {
    try {
      const apiResponse = await fetch(`${GO_GETTA_PROD_URL}/locations-by-slug/${slug}`, {
        method: 'HEAD',
        // Add a reasonable timeout to prevent middleware from hanging
        signal: AbortSignal.timeout(5000)
      });
      
      // If the location exists, let the request continue normally
      if (apiResponse.ok) {
        return NextResponse.next();
      }
      
      // If we get a 404, try to find a matching location
      if (apiResponse.status === 404) {
        console.log(`Location slug not found: ${slug}, attempting redirect search`);
        
        const newSlug = await findLocationBySlugSearch(slug);
        
        if (newSlug && newSlug !== slug) {
          // Create a 301 redirect to the new location
          const newUrl = new URL(pathname.replace(slug, newSlug), request.url);
          // Preserve any query parameters and hash
          newUrl.search = request.nextUrl.search;
          newUrl.hash = request.nextUrl.hash;
          
          console.log(`Redirecting ${slug} -> ${newSlug}`);
          return NextResponse.redirect(newUrl, 301);
        }
        
        console.log(`No matching location found for slug: ${slug}`);
      }
    } catch (error) {
      console.error('Error in middleware redirect logic:', error);
      // Continue with normal flow if there's an error
    }
  }
  
  // If we can't find a redirect, continue with the normal flow (which will show 404)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/locations/:slug*'
  ]
};