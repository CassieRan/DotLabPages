(function () {
  "use strict";

  var LANG_KEY = "dotlab-lang";
  var DEFAULT_LANG = "zh-CN";

  var PRIVACY_LINKS = {
    "zh-CN": "private.html",
    en: "private_en.html",
    ja: "private_ja.html"
  };

  var SOCIAL_PLATFORMS = [
    { key: "pinterest", label: "Pinterest", icon: "pinterest" },
    { key: "tiktok", label: "TikTok", icon: "tiktok" },
    { key: "douyin", label: "抖音", icon: "douyin" },
    { key: "xiaohongshu", label: "小红书", icon: "xiaohongshu" },
    { key: "email", label: "Email", icon: "email" },
    { key: "website", label: "Website", icon: "website" }
  ];

  var state = {
    lang: DEFAULT_LANG,
    copy: null,
    downloads: null,
    social: null,
    screenshots: null
  };

  function isPlaceholder(value) {
    return !value || String(value).trim().indexOf("TODO:") === 0;
  }

  function fetchJson(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) {
        throw new Error("Failed to load " + path);
      }
      return response.json();
    });
  }

  function applyTheme(theme) {
    if (!theme) return;
    var root = document.documentElement;
    var map = {
      primary: "--color-primary",
      accent: "--color-accent",
      background: "--color-bg",
      background_secondary: "--color-bg-secondary",
      text: "--color-text",
      text_muted: "--color-text-muted"
    };

    Object.keys(map).forEach(function (key) {
      if (theme[key]) {
        root.style.setProperty(map[key], theme[key]);
      }
    });
  }

  function setLanguage(lang) {
    state.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;

    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });

    var privacyLink = document.getElementById("privacy-link");
    if (privacyLink) {
      privacyLink.href = PRIVACY_LINKS[lang] || PRIVACY_LINKS[DEFAULT_LANG];
    }

    if (state.copy) {
      applyCopy(state.copy);
    }

    renderScreenshots();
    renderSocialLinks();
    updateMeta();
  }

  function applyCopy(copy) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (copy[key] !== undefined && copy[key] !== null) {
        el.textContent = copy[key];
      }
    });

    document.title = copy.app_name + " " + copy.app_name_sub;
  }

  function updateMeta() {
    if (!state.copy) return;
    var description = document.querySelector('meta[name="description"]');
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDescription = document.querySelector('meta[property="og:description"]');

    if (description) description.content = state.copy.description_short;
    if (ogTitle) ogTitle.content = state.copy.app_name + " " + state.copy.app_name_sub;
    if (ogDescription) ogDescription.content = state.copy.description_short;
  }

  function renderDownloadButtons() {
    var container = document.getElementById("download-buttons");
    if (!container || !state.downloads || !state.copy) return;

    container.innerHTML = "";

    var stores = [
      {
        id: "app_store",
        availableKey: "app_store_available",
        badge: "site-content/downloads/appstore_badge.svg",
        alt: "Download on the App Store"
      },
      {
        id: "google_play",
        availableKey: "google_play_available",
        badge: "site-content/downloads/google_play_badge.svg",
        alt: "Get it on Google Play"
      },
      {
        id: "apkpure",
        availableKey: "apkpure_available",
        type: "apkpure"
      }
    ];

    stores.forEach(function (store) {
      var url = state.downloads[store.id];
      var available = state.downloads[store.availableKey] === true && !isPlaceholder(url);
      var el;

      if (store.type === "apkpure") {
        el = document.createElement(available ? "a" : "span");
        el.className = "download-btn download-btn--apkpure" + (available ? "" : " is-disabled");
        el.innerHTML =
          "<span><small>（Android）</small>APKPure</span>";
        if (available) {
          el.href = url;
          el.target = "_blank";
          el.rel = "noopener noreferrer";
        } else {
          el.title = state.copy.download_coming_soon;
        }
      } else {
        el = document.createElement(available ? "a" : "span");
        el.className = "download-btn download-btn--" + store.id.replace(/_/g, "-") + (available ? "" : " is-disabled");
        el.innerHTML = '<img src="' + store.badge + '" alt="' + store.alt + '">';
        if (available) {
          el.href = url;
          el.target = "_blank";
          el.rel = "noopener noreferrer";
        } else {
          el.title = state.copy.download_coming_soon;
        }
      }

      container.appendChild(el);
    });
  }

  function getScreenshotLocale() {
    if (!state.screenshots || !state.screenshots.locales) return null;
    return state.screenshots.locales[state.lang] || state.screenshots.locales[DEFAULT_LANG];
  }

  function screenshotSrc(folder, file) {
    return "site-content/screenshots/" + folder + "/" + file;
  }

  function screenshotAlt(index) {
    var appName = state.copy && state.copy.app_name ? state.copy.app_name : "App";
    return appName + " " + (index + 1);
  }

  function renderScreenshots() {
    var track = document.getElementById("screenshots-track");
    var heroShot = document.getElementById("hero-screenshot");
    var locale = getScreenshotLocale();
    if (!track || !locale) return;

    track.innerHTML = "";
    var placeholder = "site-content/screenshots/placeholder.svg";
    var files = locale.files || [];

    if (files.length === 0) {
      track.innerHTML = '<p class="social-empty">请在 site-content/screenshots/manifest.json 中配置截图列表</p>';
      return;
    }

    files.forEach(function (file, index) {
      var src = screenshotSrc(locale.folder, file);
      var card = document.createElement("div");
      card.className = "screenshot-card";

      var img = document.createElement("img");
      img.src = src;
      img.alt = screenshotAlt(index);
      img.loading = index === 0 ? "eager" : "lazy";
      img.onerror = function () {
        img.src = placeholder;
      };

      card.appendChild(img);
      track.appendChild(card);

      if (index === 0 && heroShot) {
        heroShot.src = src;
        heroShot.alt = screenshotAlt(0);
        heroShot.onerror = function () {
          heroShot.src = placeholder;
        };
      }
    });
  }

  function socialHref(key, value) {
    var normalized = value ? String(value).trim() : "";
    if (!normalized || isPlaceholder(normalized)) return "";
    if (key === "email") return "mailto:" + normalized;
    return normalized;
  }

  function renderSocialLinks() {
    var container = document.getElementById("social-links");
    if (!container || !state.social) return;

    container.innerHTML = "";
    var hasLink = false;

    SOCIAL_PLATFORMS.forEach(function (platform) {
      var value = state.social[platform.key];
      var href = socialHref(platform.key, value);
      if (!href) return;

      hasLink = true;
      var link = document.createElement("a");
      link.className = "social-link";
      link.href = href;
      link.target = platform.key === "email" ? "_self" : "_blank";
      if (platform.key !== "email") {
        link.rel = "noopener noreferrer";
      }
      link.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' + getSocialIcon(platform.icon) + "</svg>" +
        "<span>" + platform.label + "</span>";
      container.appendChild(link);
    });

    if (!hasLink) {
      var empty = document.createElement("p");
      empty.className = "social-empty";
      empty.textContent = "TODO: 请在 site-content/social/links.json 中填写社交媒体链接";
      container.appendChild(empty);
    }
  }

  function getSocialIcon(name) {
    var icons = {
      pinterest: '<path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12c0 4.1 2.5 7.6 6 9.2-.1-.8-.1-2 0-3 .2-.9 1.4-5.8 1.4-5.8s-.4-.8-.4-2c0-1.9 1.1-3.3 2.5-3.3 1.2 0 1.7.9 1.7 2 0 1.2-.8 3.1-1.2 4.8-.3 1.4.7 2.6 2.1 2.6 2.5 0 4.4-2.6 4.4-6.4 0-3.3-2.4-5.6-5.8-5.6-4 0-6.3 3-6.3 6.1 0 1.2.5 2.5 1.1 3.2.1.1.1.2.1.3-.1.4-.3 1.3-.4 1.5-.1.2-.3.2-.5.1-1.4-.6-2.2-2.5-2.2-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6.1 0 3.6-2.3 6.5-5.5 6.5-1.1 0-2.1-.6-2.5-1.3l-.7 2.6c-.2 1-.8 2.3-1.2 3.1.9.3 1.9.4 2.9.4 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>',
      tiktok: '<path fill="currentColor" d="M16.5 3h-3.1c.2 1.4.8 2.7 1.8 3.7 1 1 2.3 1.6 3.7 1.8v3.1c-1.4 0-2.8-.4-4-1.1v6.7c0 3.4-2.8 6.2-6.2 6.2S2.5 20.4 2.5 17 5.3 10.8 8.7 10.8c.4 0 .9.1 1.3.1v3.2c-.4-.1-.8-.2-1.3-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V3z"/>',
      douyin: '<path fill="currentColor" d="M16 8.5c1.2.9 2.7 1.4 4.3 1.4V12c-1.2 0-2.3-.3-3.3-.8v5.8c0 3-2.4 5.4-5.4 5.4S6.2 20 6.2 17s2.4-5.4 5.4-5.4c.3 0 .6 0 .9.1v3.1c-.3-.1-.6-.2-.9-.2-1.3 0-2.3 1-2.3 2.3s1 2.3 2.3 2.3 2.3-1 2.3-2.3V3H16v5.5z"/>',
      xiaohongshu: '<path fill="currentColor" d="M4 4h16v16H4V4zm3.5 3.5v9h2.2l.8-2.4h3l.8 2.4H16l-3.5-9h-5zm3 2.2 1.1 3h-2.2l1.1-3z"/>',
      email: '<path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.2l8 5 8-5V6H4zm16 2.8-7.4 4.6a1 1 0 0 1-1.2 0L4 8.8V18h16V8.8z"/>',
      website: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3.2a15.4 15.4 0 0 0-1.2-4.7A8 8 0 0 1 19.9 11zM12 4c.9 1.4 1.6 3.6 2 6H10c.4-2.4 1.1-4.6 2-6zM8.5 6.3A15.4 15.4 0 0 0 7.3 11H4.1a8 8 0 0 1 4.4-4.7zM4.1 13h3.2c.3 1.7.8 3.3 1.2 4.7A8 8 0 0 1 4.1 13zm5.4 6.7c-.4-1.4-.9-3-1.2-4.7h4c-.4 2.4-1.1 4.6-2 6a8.1 8.1 0 0 1-1.2-1.3zm3.5 1.3c.9-1.4 1.6-3.6 2-6h2c-.4 2.4-1.1 4.6-2 6-.6-.8-1.3-1.5-2-2zm4.8-1.3h3.2a8 8 0 0 1-4.4 4.7c.4-1.4.9-3 1.2-4.7z"/>'
    };
    return icons[name] || icons.website;
  }

  function bindLanguageSwitch() {
    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        loadCopy(lang).then(function () {
          setLanguage(lang);
          renderDownloadButtons();
        });
      });
    });
  }

  function loadCopy(lang) {
    return fetchJson("site-content/copy/" + lang + ".json").then(function (copy) {
      state.copy = copy;
      return copy;
    });
  }

  function init() {
    var savedLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;

    Promise.all([
      loadCopy(savedLang),
      fetchJson("site-content/downloads/links.json"),
      fetchJson("site-content/social/links.json"),
      fetchJson("site-content/theme/colors.json"),
      fetchJson("site-content/screenshots/manifest.json")
    ])
      .then(function (results) {
        state.downloads = results[1];
        state.social = results[2];
        applyTheme(results[3]);
        state.screenshots = results[4];

        bindLanguageSwitch();
        setLanguage(savedLang);
        renderDownloadButtons();
      })
      .catch(function (error) {
        console.error(error);
        var main = document.querySelector("main");
        if (main) {
          var notice = document.createElement("div");
          notice.className = "container";
          notice.style.padding = "24px 0";
          notice.style.color = "#fca5a5";
          notice.textContent =
            "内容加载失败。请通过本地服务器打开（例如：python3 -m http.server），不要直接用 file:// 打开。";
          main.prepend(notice);
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
