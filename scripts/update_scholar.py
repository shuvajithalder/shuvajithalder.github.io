#!/usr/bin/env python3
"""
Google Scholar Metrics Sync Script
===================================
Automatically updates 'data/publications.json' with the latest citations,
h-index, i10-index, and annual citation trend history from a Google Scholar Profile.
Uses 'scholarly' Python package.
"""

import os
import json
import sys

# ==========================================================================
# CONFIGURATION
# Replace this with your actual Google Scholar Profile ID (12 characters).
# Example: "n1t5S0QAAAAJ" (Albert Einstein's ID or your own ID from the profile URL)
# ==========================================================================
SCHOLAR_PROFILE_ID = "oHMjazAAAAAJ" 

def main():
    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'publications.json')
    
    # 1. Check if publications.json exists
    if not os.path.exists(json_path):
        print(f"Error: publications.json not found at expected path: {json_path}")
        sys.exit(1)

    # 2. Open and load existing data
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 3. Check if a valid profile ID is configured
    if not SCHOLAR_PROFILE_ID or SCHOLAR_PROFILE_ID == "YOUR_SCHOLAR_ID_HERE":
        print("[INFO] Google Scholar ID not configured yet ('YOUR_SCHOLAR_ID_HERE'). Skipping automatic sync.")
        print("[INFO] Please edit 'scripts/update_scholar.py' and set your SCHOLAR_PROFILE_ID.")
        sys.exit(0)

    print(f"[SYNC] Initializing connection to Google Scholar for ID: {SCHOLAR_PROFILE_ID}...")

    try:
        # We import scholarly inside so that it doesn't fail immediately if not installed
        from scholarly import scholarly
    except ImportError:
        print("Error: 'scholarly' package not found. Run 'pip install scholarly'.")
        sys.exit(1)

    try:
        # Fetch profile
        print("[SYNC] Fetching author profile data and publications...")
        author = scholarly.search_author_id(SCHOLAR_PROFILE_ID)
        # Fill sections: basics, indices, counts, and publications
        author = scholarly.fill(author, sections=['basics', 'indices', 'counts', 'publications'])
        
        print("[SYNC] Author profile found successfully!")
        print(f"Name: {author.get('name')}")
        print(f"Total Citations: {author.get('citedby', 0)}")
        print(f"h-index: {author.get('hindex', 0)}")
        print(f"i10-index: {author.get('i10index', 0)}")

        # 4. Update Profile Statistics
        data['profile']['citations'] = author.get('citedby', data['profile']['citations'])
        data['profile']['h_index'] = author.get('hindex', data['profile']['h_index'])
        data['profile']['i10_index'] = author.get('i10index', data['profile']['i10_index'])
        if author.get('affiliation'):
            data['profile']['affiliation'] = author.get('affiliation')

        # 5. Update Citation History Trend Graph Data
        cites_per_year = author.get('cites_per_year', {})
        if cites_per_year:
            print("[SYNC] Updating citation history trends...")
            # Convert keys to strings to maintain standard JSON mapping
            updated_history = {}
            for year, count in sorted(cites_per_year.items()):
                updated_history[str(year)] = count
            data['citation_history'] = updated_history

        # 6. Update Publications List dynamically from Google Scholar
        if 'publications' in author and author['publications']:
            print("[SYNC] Parsing publications list...")
            updated_pubs = []
            
            # Sort publications: year descending, then citations descending
            def get_sort_key(p):
                bib_data = p.get('bib', {})
                year_val = bib_data.get('pub_year', 0)
                try:
                    year_val = int(year_val)
                except ValueError:
                    year_val = 0
                cits_val = p.get('num_citations', 0)
                return (year_val, cits_val)

            sorted_publications = sorted(author['publications'], key=get_sort_key, reverse=True)
            
            # Take top 15 publications to maintain responsive layout sizes
            for pub in sorted_publications[:15]:
                bib = pub.get('bib', {})
                full_pub_id = pub.get('author_pub_id', '')
                pub_id = full_pub_id.split(':')[-1] if ':' in full_pub_id else full_pub_id
                
                pub_link = f"https://scholar.google.com/citations?view_op=view_citation&hl=en&user={SCHOLAR_PROFILE_ID}&citation_for_view={SCHOLAR_PROFILE_ID}:{pub_id}"
                
                # Check for journal or venue
                venue_str = bib.get('journal', bib.get('venue', bib.get('conference', 'Academic Journal')))
                
                updated_pubs.append({
                    "title": bib.get('title', 'Academic Research Article'),
                    "authors": bib.get('author', author.get('name', 'Shuvajit Halder')),
                    "venue": venue_str,
                    "year": int(bib.get('pub_year')) if bib.get('pub_year') and str(bib.get('pub_year')).isdigit() else 2025,
                    "citations": pub.get('num_citations', 0),
                    "link": pub_link
                })
            
            data['publications'] = updated_pubs
            print(f"[SYNC] Successfully parsed and formatted {len(updated_pubs)} publication articles.")

        # 7. Save back to publications.json
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print("[SUCCESS] Dynamic publications.json successfully synced with latest Scholar metrics and articles!")

    except Exception as e:
        print(f"[ERROR] Sync failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
