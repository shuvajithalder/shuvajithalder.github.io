# Professional Portfolio & Academic Website

A modern, minimalistic, responsive, and production-ready personal website designed for **shuvajithalder.github.io** (hosted on GitHub Pages). This project delivers premium visual aesthetics, smooth micro-interactions, dark/light mode toggle with persistent selection, dynamic integrations, and custom media portfolios.

## 🚀 Key Features

* **Ultra-Fast & DRY Architecture**: Styled entirely in vanilla HSL CSS, loading a single-page HTML structure with a hash-based routing engine. Instant page loads (0ms transition lag) and zero theme flashes.
* **Persistent Dark/Light Mode**: Elegant default dark mode utilizing luxurious deep navy-blue tones, and light mode using clean ice-blue tones, persisting selections across sessions.
* **Dynamic Google Scholar Integration**: Real-time academic indices displays (citations, h-index, i10-index) and a fully customized, interactive **Chart.js citation trend graph** that dynamically adapts to active dark/light themes. Includes an automated weekly sync script.
* **Dynamic GitHub Portfolio**: Client-side async fetching of public repositories, complete with language tags, stars, forks, live keyword search, and coding-language category filter tags. Integrates high-performance visual loading skeletons.
* **Custom Photography Gallery & Lightbox**: A fluid, categorized photography grid (Nature, Architecture, Travel, Urban) equipped with an immersive Lightbox viewer supporting keyboard arrows, Escape controls, and swipe transitions.
* **Curated Resource Center**: Category-organized links to external portals and tools frequently used, fully responsive and modular.
* **Secure Glassmorphic Contact Form**: Live client-side input validation submitting messages securely through **Web3Forms** email gateway—protecting your private email address from being exposed in public HTML.
* **Privacy-Friendly Visitor Counter**: A live counting badge located in the footer tracking traffic automatically with a local storage persistent fallback.

---

## 📂 Project Structure

```
Github_Page/
├── index.html                   # Core HTML structural wrapper (SEO & Accessibility optimized)
├── css/
│   └── styles.css               # Design tokens, global themes, layout rules & custom keyframes
├── js/
│   ├── main.js                  # Global Orchestrator (Theme controller, Hash Router, Visitor counter)
│   ├── scholar.js               # Scholar data populator & theme-responsive Chart.js renderer
│   ├── github.js                # GitHub API repository aggregator with dynamic filters & searches
│   ├── photography.js           # Category-filtered photos grid & key-bound custom Lightbox
│   └── contact.js               # Resource catalog populator & Contact validator (Web3Forms post)
├── data/
│   ├── publications.json        # Curated academic degrees, publications lists, and citations
│   ├── photos.json              # Photography portfolio records (Unsplash CDNs & paths)
│   └── resources.json           # Categorized curated external links
├── scripts/
│   └── update_scholar.py        # Python sync script to fetch indices and citation counts from Scholar
└── .github/
    └── workflows/
        └── scholar_sync.yml     # Weekly GitHub Actions automated cron metrics updater
```

---

## 🛠️ Setup & Customization Guide

This website is designed to be **extremely developer-friendly** and 100% prepared for instant hosting. Customize your site by following these simple steps:

### 1. Configure the Secure Contact Form
To start receiving emails from your contact form directly in your inbox:
1. Visit [Web3Forms](https://web3forms.com/) and enter your email address to receive a **Free Access Key** (takes 5 seconds, no registration needed!).
2. Open `index.html` and search for:
   ```html
   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
   ```
3. Replace `YOUR_ACCESS_KEY_HERE` with the key you received.
*Note: Before you replace the key, the form runs in a mock simulation mode so you can preview its success modals and animation immediately!*

### 2. Configure Dynamic Scholar Auto-Sync
To automate syncing your academic metrics from Google Scholar:
1. Open `scripts/update_scholar.py` and replace `YOUR_SCHOLAR_ID_HERE` with your 12-character Google Scholar ID (found in your profile's URL, e.g., `https://scholar.google.com/citations?user=n1t5S0QAAAAJ`, ID is `n1t5S0QAAAAJ`):
   ```python
   SCHOLAR_PROFILE_ID = "YOUR_SCHOLAR_ID_HERE"
   ```
2. When you push this to GitHub, the Actions Workflow in `.github/workflows/scholar_sync.yml` will automatically run every Sunday at midnight (UTC) to fetch your citations and indices using python `scholarly`, update `publications.json`, and commit the changes back to your branch!
*Note: If no ID is set, the website securely loads your manually defined numbers in `publications.json` without failing!*

### 3. Add Custom Data (JSON Datastores)
You do not need to write complex HTML to update your website content. Simply edit the clean files in the `data/` folder:
* **Academic degrees & papers**: Open `data/publications.json` to update your institutional degrees, manual publication lists (titles, DOI links, citations), or collaborator affiliations.
* **Photography**: Open `data/photos.json` to append new image records. You can use direct image paths like `assets/images/gallery/myphoto.jpg` or external CDN links like Unsplash!
* **Curated Links**: Open `data/resources.json` to manage links and category descriptions.

### 4. Upload your CV/Resume
Simply rename your CV to `resume.pdf` and place it inside the folder:
`assets/docs/resume.pdf`
The download button on the Home banner is fully linked to this path out-of-the-box!

---

## ⚡ Hosting on GitHub Pages

1. Create a repository on GitHub named `shuvajithalder.github.io`.
2. Push this entire codebase to the `main` or `master` branch.
3. In your GitHub repository:
   * Go to **Settings** -> **Pages**.
   * Under **Build and deployment**, set Source to **Deploy from a branch**.
   * Select your branch (e.g., `main` or `root`) and folder `/ (root)`.
   * Click **Save**.
4. Your professional website will be live at `https://shuvajithalder.github.io/` in less than a minute!
