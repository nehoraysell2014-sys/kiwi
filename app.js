// Kiwi Educational Assistant - Application Logic
import { auth, signInAnonymously, onAuthStateChanged, db, doc, getDoc, setDoc, updateDoc, increment } from './firebase.js';

// DOM Elements
const bodyEl = document.body;
const sidebarEl = document.getElementById('sidebar');
const mobileSidebarToggleBtn = document.getElementById('mobile-sidebar-toggle');
const mobileSidebarCloseBtn = document.getElementById('mobile-sidebar-close');
const langEnBtn = document.getElementById('lang-en-btn');
const langHeBtn = document.getElementById('lang-he-btn');
const subjectCards = document.querySelectorAll('.subject-card');
const gradeSelect = document.getElementById('grade-level-select');
const factContent = document.getElementById('fact-content');
const generateFactBtn = document.getElementById('generate-fact-btn');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const submitQuizBtn = document.getElementById('submit-quiz-btn');
const quizFeedbackBox = document.getElementById('quiz-feedback');
const quizFeedbackText = document.getElementById('quiz-feedback-text');
const nextQuizBtn = document.getElementById('next-quiz-btn');
const badgeSubject = document.getElementById('badge-subject');
const badgeGrade = document.getElementById('badge-grade');
const badgeTokens = document.getElementById('badge-tokens');
const themeModeBtn = document.getElementById('theme-mode-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const chatMessagesContainer = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const suggestionsBox = document.getElementById('suggestions-box');
const userMessageInput = document.getElementById('user-message-input');
const chatForm = document.getElementById('chat-form');
const voiceInputBtn = document.getElementById('voice-input-btn');
const dirToggleBtn = document.getElementById('dir-toggle-btn');
const toastContainer = document.getElementById('toast-container');
const lockScreenContainer = document.getElementById('lock-screen');
const lockScreenForm = document.getElementById('lock-screen-form');
const sitePasswordInput = document.getElementById('site-password-input');
const lockScreenError = document.getElementById('lock-screen-error');
const appContainer = document.querySelector('.app-container');

let userUid = null;
appContainer.style.display = 'none';

// Localization Dictionary
const TRANSLATIONS = {
  en: {
    "tagline": "Study Assistant",
    "language-settings": "Language",
    "subject-focus": "Subject Focus",
    "sub-general": "General",
    "sub-math": "Math",
    "sub-science": "Science",
    "sub-history": "History",
    "sub-literature": "Literature",
    "grade-level": "Grade Level",
    "grade-elementary": "Elementary School",
    "grade-middle": "Middle School",
    "grade-high": "High School",
    "grade-university": "University",
    "api-settings": "Gemini API Key",
    "api-missing": "API Key Required",
    "api-active": "Gemini API Active",
    "save-key": "Save Key",
    "clear-key": "Clear",
    "api-help": "Enter a Gemini API Key to enable the live model. It is stored locally in your browser and sent directly to Google.",
    "daily-fact": "Daily Fun Fact",
    "fact-placeholder": "Click below to learn something awesome today!",
    "get-fact": "Learn Something New!",
    "quick-quiz": "Quick Quiz",
    "submit-answer": "Submit Answer",
    "next-quiz": "Next Quiz",
    "kiwi-status": "Active Study Assistant",
    "input-placeholder": "Ask Kiwi a question about your studies...",
    "submit-quiz-prompt": "Select a subject above to get a quiz!",
    "welcome-msg": "Hello, Kiwi here, and I am here to help you with anything related to your studies.",
    "api-key-needed-msg": "Welcome to Kiwi! Please configure your **Gemini API Key** in the project `.env` file to begin.",
    "listening": "Listening...",
    "cleared-chat": "Chat history cleared",
    "api-saved": "Gemini API Key saved successfully!",
    "api-cleared": "API Key cleared.",
    "error-api": "Please enter a valid API key.",
    "correct": "Correct! 🎉",
    "incorrect": "Incorrect. Try again! 💡",
    "generating": "Generating...",
    "mic-error": "Speech recognition failed or is not supported."
  },
  he: {
    "tagline": "עוזר לימודים",
    "language-settings": "שפה",
    "subject-focus": "נושא לימוד",
    "sub-general": "כללי",
    "sub-math": "מתמטיקה",
    "sub-science": "מדעים",
    "sub-history": "היסטוריה",
    "sub-literature": "ספרות",
    "grade-level": "שלב חינוכי",
    "grade-elementary": "בית ספר יסודי",
    "grade-middle": "חטיבת ביניים",
    "grade-high": "תיכון",
    "grade-university": "אוניברסיטה/מכללה",
    "api-settings": "מפתח API של Gemini",
    "api-missing": "נדרש מפתח API",
    "api-active": "מפתח Gemini פעיל",
    "save-key": "שמור מפתח",
    "clear-key": "נקה",
    "api-help": "הזן מפתח API של Gemini כדי להפעיל את המודל. המפתח נשמר בדפדפן ונשלח ישירות לגוגל.",
    "daily-fact": "עובדה יומית מעניינת",
    "fact-placeholder": "לחץ למטה כדי ללמוד משהו מדליק היום!",
    "get-fact": "למד משהו חדש!",
    "quick-quiz": "בחן את עצמך",
    "submit-answer": "שלח תשובה",
    "next-quiz": "השאלה הבאה",
    "kiwi-status": "עוזר לימודים פעיל",
    "input-placeholder": "שאל את קיווי שאלה על הלימודים שלך...",
    "submit-quiz-prompt": "בחר נושא למעלה כדי לקבל שאלון!",
    "welcome-msg": "שלום כאן קיווי ואני כאן כדי לעזור לך בכל דבר הנוגע ללמודים.",
    "api-key-needed-msg": "ברוכים הבאים לקיווי! אנא הגדר את **מפתח ה-API של Gemini** בקובץ ה-`.env` של הפרויקט כדי להתחיל.",
    "listening": "מאזין...",
    "cleared-chat": "היסטוריית הצ'אט נמחקה",
    "api-saved": "מפתח ה-API של Gemini נשמר בהצלחה!",
    "api-cleared": "מפתח ה-API נמחק.",
    "error-api": "אנא הזן מפתח API תקין.",
    "correct": "נכון מאוד! 🎉",
    "incorrect": "לא מדויק, נסה שוב! 💡",
    "generating": "מייצר...",
    "mic-error": "זיהוי דיבור נכשל או אינו נתמך בדפדפן זה."
  }
};

// Fallback facts and quizzes in case there's no API key active
const FALLBACK_FACTS = {
  en: {
    math: "Did you know? Zero is the only number that cannot be represented in Roman numerals.",
    science: "Did you know? Light travels from the Sun to Earth in about 8 minutes and 19 seconds.",
    history: "Did you know? The oldest continuously operating university in the world is the University of al-Qarawiyyin in Morocco, founded in 859 AD.",
    literature: "Did you know? The shortest grammatically correct sentence in English is 'Go.'",
    general: "Did you know? Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!"
  },
  he: {
    math: "הידעת? אפס הוא המספר היחיד שאינו ניתן לייצוג בספרות רומיות.",
    science: "הידעת? לוקח לאור מהשמש כ-8 דקות ו-19 שניות להגיע לכדור הארץ.",
    history: "הידעת? האוניברסיטה הוותיקה ביותר בעולם שעדיין פועלת ברציפות היא אוניברסיטת אל-קרוויין במרוקו, שנוסדה בשנת 859 לספירה.",
    literature: "הידעת? המשפט הקצר ביותר באנגלית התקני מבחינה דקדוקית הוא 'Go.'",
    general: "הידעת? דבש לעולם אינו מתקלקל. ארכיאולוגים מצאו כדים של דבש בקברים מצריים עתיקים בני למעלה מ-3,000 שנה שהיה אכיל לחלוטין!"
  }
};

const FALLBACK_QUIZZES = {
  en: {
    math: {
      question: "What is the value of x if 3x - 7 = 8?",
      options: ["x = 3", "x = 5", "x = 15", "x = 2"],
      correctIndex: 1,
      explanation: "Add 7 to both sides to get 3x = 15. Divide by 3 to get x = 5."
    },
    science: {
      question: "Which organelle is known as the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
      correctIndex: 2,
      explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions."
    },
    history: {
      question: "Who was the first President of the United States?",
      options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"],
      correctIndex: 1,
      explanation: "George Washington served as the first president of the United States from 1789 to 1797."
    },
    literature: {
      question: "Which of the following is a figure of speech that directly compares two things using 'like' or 'as'?",
      options: ["Metaphor", "Simile", "Personification", "Alliteration"],
      correctIndex: 1,
      explanation: "A simile compares two things using words such as 'like' or 'as' (e.g., 'as brave as a lion')."
    },
    general: {
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Saturn", "Jupiter", "Neptune"],
      correctIndex: 2,
      explanation: "Jupiter is the largest planet, with a mass more than two and a half times that of all the other planets combined."
    }
  },
  he: {
    math: {
      question: "מה הערך של x אם 3x - 7 = 8?",
      options: ["x = 3", "x = 5", "x = 15", "x = 2"],
      correctIndex: 1,
      explanation: "נוסיף 7 לשני האגפים ונקבל 3x = 15. נחלק ב-3 ונקבל x = 5."
    },
    science: {
      question: "איזה אברונון מכונה 'תחנת הכוח של התא'?",
      options: ["גרעין התא", "ריבוזום", "מיטוכונדריה", "מערכת גולג'י"],
      correctIndex: 2,
      explanation: "המיטוכונדריה מייצרת את רוב האנרגיה הכימית הדרושה לתפקודי התא."
    },
    history: {
      question: "מי היה הנשיא הראשון של ארצות הברית?",
      options: ["תומאס ג'פרסון", "ג'ורג' וושינגטון", "אברהם לינקולן", "ג'ון אדמס"],
      correctIndex: 1,
      explanation: "ג'ורג' וושינגטון כיהן כנשיא הראשון של ארה\"ב בין השנים 1789-1797."
    },
    literature: {
      question: "איזה אמצעי ספרותי משווה ישירות בין שני דברים באמצעות המילים 'כמו' או 'כפי'?",
      options: ["מטאפורה", "דימוי", "האנשה", "אליטרציה"],
      correctIndex: 1,
      explanation: "דימוי משווה בין שני דברים באמצעות מילות יחס כמו 'כמו' (למשל: 'אמיץ כמו אריה')."
    },
    general: {
      question: "מהו כוכב הלכת הגדול ביותר במערכת השמש שלנו?",
      options: ["כדור הארץ", "שבתאי", "צדק", "נפטון"],
      correctIndex: 2,
      explanation: "צדק הוא כוכב הלכת הגדול ביותר, ומסתו גדולה פי 2.5 ממסת כל שאר כוכבי הלכת גם יחד."
    }
  }
};

const SUGGESTIONS = {
  en: {
    general: ["Help me study for my exams", "Explain the concept of photosynthesis", "Give me a daily study schedule"],
    math: ["Solve the quadratic equation: x^2 - 5x + 6 = 0", "Explain the Pythagorean theorem simply", "What is a derivative?"],
    science: ["Explain the water cycle step by step", "What is gravity?", "How do batteries work?"],
    history: ["Why did the Roman Empire fall?", "Tell me about the French Revolution", "Who was Mahatma Gandhi?"],
    literature: ["What is a metaphor vs. a simile?", "Summarize Shakespeare's Hamlet", "What are the main themes of 1984?"]
  },
  he: {
    general: ["עזור לי להתכונן למבחן", "הסבר לי מהי פוטוסינתזה", "תציע לי תוכנית לימודים יומית"],
    math: ["פתור את המשוואה הריבועית: x^2 - 5x + 6 = 0", "הסבר את משפט פיתגורס בפשטות", "מהו נגזרת במתמטיקה?"],
    science: ["הסבר את מחזור המים שלב אחר שלב", "מהו כוח הכבידה?", "איך עובדת סוללה?"],
    history: ["מדוע נפלה האימפריה הרומית?", "ספר לי על המהפכה הצרפתית", "מי היה מהטמה גנדי?"],
    literature: ["מה ההבדל בין מטאפורה לדימוי?", "סכם לי את המחזה המלט של שייקספיר", "מהם הנושאים המרכזיים בספר 1984?"]
  }
};

// Application State
let state = {
  language: localStorage.getItem('kiwi_lang') || 'en',
  subject: localStorage.getItem('kiwi_subject') || 'general',
  grade: localStorage.getItem('kiwi_grade') || 'middle',
  theme: localStorage.getItem('kiwi_theme') || 'light',
  chatHistory: [], // stores local session logs for context [{ role: "user" | "model", text: "" }]
  currentQuiz: null,
  selectedQuizOptionIndex: null,
  totalTokens: parseInt(localStorage.getItem('kiwi_tokens')) || 0,
  promptTokens: parseInt(localStorage.getItem('kiwi_prompt_tokens')) || parseInt(localStorage.getItem('kiwi_tokens')) || 0,
  completionTokens: parseInt(localStorage.getItem('kiwi_completion_tokens')) || 0,
  sessionTokens: 0,
  sessionPromptTokens: 0,
  sessionCompletionTokens: 0
};

// Get API Key helper (returns environment variable key directly)
function getApiKey() {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  const directKey = import.meta.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'your_gemini_api_key_here') {
    return envKey;
  }
  if (directKey && directKey !== 'your_gemini_api_key_here') {
    return directKey;
  }
  return '';
}

// Check if live API Key is available
function isLiveApiAvailable() {
  return !!getApiKey();
}

// --------------------------------------------------------------------------
// Core Actions & UI Updates
// --------------------------------------------------------------------------

// Initialize Application
function init() {
  // 1. Setup Theme
  bodyEl.className = `theme-${state.theme}`;
  updateThemeButtonIcon();

  // 2. Setup Language Elements & RTL
  updateLanguageUI();

  // 3. Setup active subject design
  updateSubjectUI(state.subject, false); // don't refresh welcome message on load

  // 4. Setup Grade level select
  gradeSelect.value = state.grade;
  badgeGrade.textContent = getGradeTranslation(state.grade);

  // 5. Setup Suggestions
  renderSuggestions();

  // 7. Inject welcome greetings
  resetChat(false);

  // 8. Generate initial quiz / fact fallbacks
  loadFact();
  loadQuiz();

  // 9. Initialise Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 10. Update Token UI
  updateTokenUI();
}

function updateTokenUI() {
  if (badgeTokens) {
    const cost = (state.promptTokens / 1000000) * 0.10 + (state.completionTokens / 1000000) * 0.40;
    let costStr = cost.toFixed(4);
    if (cost === 0) costStr = "0.00";
    else if (cost < 0.0001) costStr = "<0.0001";
    
    const tokenLabel = state.language === 'he' ? 'טוקנים' : 'Tokens';
    badgeTokens.textContent = `${tokenLabel}: ${state.totalTokens.toLocaleString()} ($${costStr})`;
  }
}

// Switch Languages & adjust HTML properties (dir, lang)
function updateLanguageUI() {
  const lang = state.language;
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'he') ? 'rtl' : 'ltr';

  // Toggle button styles
  if (lang === 'en') {
    langEnBtn.classList.add('active');
    langHeBtn.classList.remove('active');
  } else {
    langHeBtn.classList.add('active');
    langEnBtn.classList.remove('active');
  }

  // Translate DOM nodes with data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[lang][key]) {
      el.textContent = TRANSLATIONS[lang][key];
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (TRANSLATIONS[lang][key]) {
      el.placeholder = TRANSLATIONS[lang][key];
    }
  });

  // Update input placeholder in case it's custom
  userMessageInput.placeholder = TRANSLATIONS[lang]["input-placeholder"];

  // Update badges
  badgeGrade.textContent = getGradeTranslation(state.grade);
  updateSubjectBadge();
  
  // Re-render suggestions
  renderSuggestions();

  // Re-render quiz & fact
  loadFact();
  loadQuiz();
}

function getGradeTranslation(gradeVal) {
  const lang = state.language;
  switch (gradeVal) {
    case 'elementary': return TRANSLATIONS[lang]['grade-elementary'];
    case 'middle': return TRANSLATIONS[lang]['grade-middle'];
    case 'high': return TRANSLATIONS[lang]['grade-high'];
    case 'university': return TRANSLATIONS[lang]['grade-university'];
    default: return gradeVal;
  }
}

// Switch active subject focus and change colors
function updateSubjectUI(subjectVal, clearChat = true) {
  state.subject = subjectVal;
  localStorage.setItem('kiwi_subject', subjectVal);

  // Set colors on root based on active subject
  const root = document.documentElement;
  root.style.setProperty('--accent-color', `var(--color-${subjectVal})`);
  root.style.setProperty('--accent-light', `var(--color-${subjectVal}-light)`);
  root.style.setProperty('--accent-glow', `var(--color-${subjectVal}-glow)`);

  // Update visual cards active styles
  subjectCards.forEach(card => {
    if (card.getAttribute('data-subject') === subjectVal) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  // Update Header badge
  updateSubjectBadge();

  // Re-generate suggestions
  renderSuggestions();

  // Re-generate Fact and Quiz widgets
  loadFact();
  loadQuiz();

  if (clearChat) {
    showToast(state.language === 'he' ? 'נושא הלימוד עודכן' : `Subject focus updated`, 'success');
    resetChat(true);
  }
}

function updateSubjectBadge() {
  const lang = state.language;
  const sub = state.subject;
  badgeSubject.textContent = TRANSLATIONS[lang][`sub-${sub}`] || sub;
  badgeSubject.className = `header-tag ${sub}-tag`;
  
  // Re-color background tag for subject dynamically if class changes
  badgeSubject.style.backgroundColor = `var(--color-${sub}-light)`;
  badgeSubject.style.color = `var(--color-${sub})`;
}

// Renders suggestion chips
function renderSuggestions() {
  const lang = state.language;
  const sub = state.subject;
  const chips = SUGGESTIONS[lang][sub] || SUGGESTIONS[lang]['general'];
  
  suggestionsBox.innerHTML = '';
  chips.forEach(text => {
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip';
    chip.textContent = text;
    chip.onclick = () => {
      userMessageInput.value = text;
      userMessageInput.focus();
      handleFormSubmit();
    };
    suggestionsBox.appendChild(chip);
  });
}

// Reset Chat Messages logs
function resetChat(injectGreeting = true) {
  chatMessagesContainer.innerHTML = '';
  state.chatHistory = [];

  if (injectGreeting) {
    const lang = state.language;
    // Welcome message
    appendMessage('bot', TRANSLATIONS[lang]["welcome-msg"]);

    // If API key is not entered, append instruction prompt
    if (!isLiveApiAvailable()) {
      appendMessage('bot', TRANSLATIONS[lang]["api-key-needed-msg"]);
    }
  }
}

// Append Chat message
function appendMessage(sender, text) {
  const messageEl = document.createElement('article');
  messageEl.className = `message ${sender}`;

  // Avatar
  const avatarImg = document.createElement('img');
  avatarImg.className = 'message-avatar';
  if (sender === 'bot') {
    avatarImg.src = '/assets/kiwi-avatar.png';
    avatarImg.alt = 'Kiwi Mascot';
  } else {
    // Standard student avatar placeholder using dicebear or local generic logo
    avatarImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
    avatarImg.alt = 'Student';
  }

  // Content Box
  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.className = 'message-bubble-wrapper';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = parseMarkdown(text);

  // Time Meta
  const meta = document.createElement('span');
  meta.className = 'message-meta';
  const now = new Date();
  meta.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  bubbleWrapper.appendChild(bubble);
  bubbleWrapper.appendChild(meta);

  messageEl.appendChild(avatarImg);
  messageEl.appendChild(bubbleWrapper);

  chatMessagesContainer.appendChild(messageEl);
  scrollToBottom();

  // Add to state history for active conversation session (cap at last 10 messages for memory efficiency)
  state.chatHistory.push({ role: sender === 'bot' ? 'model' : 'user', text });
  if (state.chatHistory.length > 10) {
    state.chatHistory.shift();
  }
}

function scrollToBottom() {
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// Show loading animation
function showLoading(show) {
  if (show) {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
  } else {
    typingIndicator.classList.add('hidden');
  }
}

// --------------------------------------------------------------------------
// Gemini API Communication
// --------------------------------------------------------------------------

// Helper for waiting/sleeping in async functions
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Parse Gemini 429 error body or compute exponential backoff
function getRetryDelay(errorBody, attempt) {
  // 1. Try to get delay from google.rpc.RetryInfo details
  const details = errorBody?.error?.details;
  if (Array.isArray(details)) {
    const retryInfo = details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo' || d.type === 'type.googleapis.com/google.rpc.RetryInfo');
    if (retryInfo && retryInfo.retryDelay) {
      const delaySecs = parseFloat(retryInfo.retryDelay);
      if (!isNaN(delaySecs) && delaySecs > 0) {
        return delaySecs * 1000;
      }
    }
  }

  // 2. Try to match regex in the error message string
  const msg = errorBody?.error?.message || '';
  const match = msg.match(/retry in\s+([0-9.]+)\s*s/i) || 
                msg.match(/try again in\s+([0-9.]+)\s*seconds/i) ||
                msg.match(/retry after\s+([0-9.]+)\s*s/i);
  if (match) {
    const delaySecs = parseFloat(match[1]);
    if (!isNaN(delaySecs) && delaySecs > 0) {
      return delaySecs * 1000;
    }
  }

  // 3. Fallback to exponential backoff (2s, 4s, 8s, 16s, 32s...) plus jitter
  const backoff = Math.pow(2, attempt) * 2000;
  const jitter = Math.random() * 1000;
  return backoff + jitter;
}

// Reusable fetch model from Gemini with automatic retry for 429 errors
async function askGemini(promptText, chatHistoryList = []) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  // Ensure user is authenticated before sending request
  const currentUid = auth.currentUser ? auth.currentUser.uid : userUid;
  if (!currentUid) {
    throw new Error('User not found. Please wait for authentication to complete or refresh the page.');
  }

  const model = "google/gemini-2.5-flash-lite";
  const url = `https://openrouter.ai/api/v1/chat/completions`;

  // Assemble system instructions
  const systemText = `
You are Kiwi, a friendly, encouraging, and clear virtual educational assistant. Your role is to help students with homework, study materials, exam prep, and academic guidance.
Personality guidelines:
- Tone: Extremely encouraging, positive, clear, and helpful. Use student-friendly language.
- Active Subject Focus: ${state.subject.toUpperCase()}. Focus your context, vocabulary, and analogies around this subject when applicable.
- Target Grade Level: ${state.grade.toUpperCase()}. Adjust your vocabulary complexity, explanation length, and teaching methodology to this grade level. (e.g. explain Math with primary arithmetic for Elementary, and calculus/algebra details for University).
- Formatting: Use standard markdown (lists, bold headings, code syntax highlight). Keep answers structured and clean.
- Language: Respond in the exact language used by the student (English or Hebrew). For Hebrew responses, maintain correct phrasing and encouragement.

Strict Educational Rules:
- NEVER reveal the final answer or solution upfront.
- Act as a Socratic guide. When a user asks a question, provide hints, explain the methodology, or ask guiding questions to help them arrive at the answer themselves.
- Only confirm the final answer AFTER the user has explicitly provided it and you have verified that it is correct.
- If the user provides a wrong answer, gently correct their process and give another hint, but still do not reveal the final answer.
`;

  // Assemble messages array including system prompt, history and current prompt
  const messages = [];
  
  // System message
  messages.push({
    role: "system",
    content: systemText
  });
  
  // Format past session conversation history
  chatHistoryList.forEach(msg => {
    messages.push({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text
    });
  });

  // Append new user message
  messages.push({
    role: "user",
    content: promptText
  });

  const requestBody = {
    model: model,
    messages: messages,
    temperature: 0.7,
    max_tokens: 1500,
    user: currentUid
  };

  const maxRetries = 5;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'Kiwi Chatbot'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.json();
        } catch (jsonErr) {
          errorBody = { error: { message: response.statusText } };
        }

        // If it's a 429 and we still have retries remaining, sleep and retry
        if (response.status === 429 && attempt < maxRetries) {
          const delayMs = getRetryDelay(errorBody, attempt);
          const delaySecs = (delayMs / 1000).toFixed(1);
          
          const lang = state.language;
          const toastMsg = lang === 'he'
            ? `עומס על השרת (429). מנסה שוב בעוד ${delaySecs} שניות...`
            : `Rate limit hit (429). Retrying in ${delaySecs} seconds...`;
          
          showToast(toastMsg, 'warning');
          
          await sleep(delayMs);
          continue; // retry
        }

        throw new Error(errorBody?.error?.message || 'OpenRouter API Error');
      }

      const responseData = await response.json();
      
      if (responseData.usage && responseData.usage.total_tokens) {
        state.totalTokens += responseData.usage.total_tokens;
        localStorage.setItem('kiwi_tokens', state.totalTokens.toString());
        
        if (responseData.usage.prompt_tokens) {
          state.promptTokens += responseData.usage.prompt_tokens;
          localStorage.setItem('kiwi_prompt_tokens', state.promptTokens.toString());
        }
        if (responseData.usage.completion_tokens) {
          state.completionTokens += responseData.usage.completion_tokens;
          localStorage.setItem('kiwi_completion_tokens', state.completionTokens.toString());
        }
        updateTokenUI();
      }
      
      return responseData.choices?.[0]?.message?.content || '';
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      throw error;
    }
  }
}

// Form submit trigger
async function handleFormSubmit() {
  const text = userMessageInput.value.trim();
  if (!text) return;

  // Clear input area
  userMessageInput.value = '';
  userMessageInput.style.height = 'auto'; // reset height

  // 1. Render User Message
  appendMessage('user', text);

  // 2. Check API Key
  if (!isLiveApiAvailable()) {
    setTimeout(() => {
      appendMessage('bot', state.language === 'he' 
        ? "שגיאה: לא הוגדר מפתח API עבור Gemini. אנא הזן מפתח API בסרגל הכלים הצידי על מנת שקיווי יוכל לענות." 
        : "Error: No Gemini API Key configured. Please enter an API key in the sidebar settings so Kiwi can answer.");
    }, 600);
    return;
  }

  // 3. Show Loading & Send to Gemini
  showLoading(true);
  try {
    // Send with current chat history session logs
    const answer = await askGemini(text, state.chatHistory.slice(0, -1)); // exclude the message we just appended in appendMessage
    showLoading(false);
    appendMessage('bot', answer);
  } catch (error) {
    showLoading(false);
    console.error('Gemini Request Failed:', error);
    appendMessage('bot', state.language === 'he' 
      ? `מצטער, נתקלתי בשגיאה בחיבור ל-Gemini: ${error.message}` 
      : `Sorry, I encountered an error connecting to Gemini: ${error.message}`);
  }
}

// --------------------------------------------------------------------------
// Widgets: Daily Fact and Quiz Actions
// --------------------------------------------------------------------------

// Fetch Daily Fact
async function loadFact() {
  const lang = state.language;
  const sub = state.subject;

  // Set visual generating state
  factContent.textContent = TRANSLATIONS[lang]["generating"];
  generateFactBtn.disabled = true;

  if (!isLiveApiAvailable()) {
    // Use local fallback
    setTimeout(() => {
      factContent.textContent = FALLBACK_FACTS[lang][sub] || FALLBACK_FACTS[lang]['general'];
      generateFactBtn.disabled = false;
    }, 300);
    return;
  }

  try {
    const factPrompt = `Generate a single short, fascinating fun educational fact about ${sub} suitable for a student in ${state.grade}. Start directly with "Did you know..." (or "הידעת..." if responding in Hebrew). Respond in ${lang === 'he' ? 'Hebrew' : 'English'}. Keep it to 1-2 sentences max.`;
    const fact = await askGemini(factPrompt);
    factContent.textContent = fact.trim();
  } catch (err) {
    console.error('Fact generation error:', err);
    factContent.textContent = FALLBACK_FACTS[lang][sub] || FALLBACK_FACTS[lang]['general'];
  } finally {
    generateFactBtn.disabled = false;
  }
}

// Load dynamic Quiz widget
async function loadQuiz() {
  const lang = state.language;
  const sub = state.subject;

  quizQuestion.textContent = TRANSLATIONS[lang]["generating"];
  quizOptions.innerHTML = '';
  submitQuizBtn.disabled = true;
  quizFeedbackBox.className = 'quiz-feedback-box hidden';
  state.selectedQuizOptionIndex = null;

  if (!isLiveApiAvailable()) {
    // Use fallback quiz
    setTimeout(() => {
      const fallbackQuiz = FALLBACK_QUIZZES[lang][sub] || FALLBACK_QUIZZES[lang]['general'];
      state.currentQuiz = fallbackQuiz;
      renderQuizData(fallbackQuiz);
    }, 300);
    return;
  }

  try {
    const quizPrompt = `Create a single multiple-choice question for a ${state.grade} student about ${sub} in ${lang === 'he' ? 'Hebrew' : 'English'}.
Return ONLY a valid JSON object matching the following structure without any markdown wrap or code blocks:
{
  "question": "A clear quiz question about ${sub}",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Explain why this option is correct."
}
Make sure correctIndex is an integer from 0 to 3. Avoid special unicode symbols in JSON values that break parsing.`;

    const rawResponse = await askGemini(quizPrompt);
    // Parse JSON safely from LLM output (clean up markdown block if model ignored restriction)
    let cleanJson = rawResponse.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.substring(7, cleanJson.length - 3).trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.substring(3, cleanJson.length - 3).trim();
    }

    const quizData = JSON.parse(cleanJson);
    state.currentQuiz = quizData;
    renderQuizData(quizData);
  } catch (err) {
    console.error('Quiz generation error:', err);
    // Fall back to pre-defined local quiz
    const fallbackQuiz = FALLBACK_QUIZZES[lang][sub] || FALLBACK_QUIZZES[lang]['general'];
    state.currentQuiz = fallbackQuiz;
    renderQuizData(fallbackQuiz);
  }
}

function renderQuizData(quiz) {
  quizQuestion.textContent = quiz.question;
  quizOptions.innerHTML = '';

  quiz.options.forEach((optText, index) => {
    const optBtn = document.createElement('button');
    optBtn.className = 'quiz-option-btn';
    optBtn.textContent = optText;
    optBtn.onclick = () => selectQuizOption(index);
    quizOptions.appendChild(optBtn);
  });
  
  submitQuizBtn.disabled = true;
  submitQuizBtn.classList.remove('hidden');
  submitQuizBtn.style.display = 'block';
}

function selectQuizOption(index) {
  if (quizFeedbackBox.classList.contains('hidden') === false) return; // Answer already submitted
  
  state.selectedQuizOptionIndex = index;
  
  // Update UI selection classes
  const buttons = quizOptions.querySelectorAll('.quiz-option-btn');
  buttons.forEach((btn, idx) => {
    if (idx === index) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  submitQuizBtn.disabled = false;
}

function handleQuizSubmit() {
  if (state.selectedQuizOptionIndex === null || !state.currentQuiz) return;

  const correct = (state.selectedQuizOptionIndex === state.currentQuiz.correctIndex);
  const lang = state.language;

  // Style the options
  const buttons = quizOptions.querySelectorAll('.quiz-option-btn');
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === state.currentQuiz.correctIndex) {
      btn.style.borderColor = '#10B981';
      btn.style.color = '#10B981';
      btn.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
    } else if (idx === state.selectedQuizOptionIndex && !correct) {
      btn.style.borderColor = '#EF4444';
      btn.style.color = '#EF4444';
      btn.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
    }
  });

  // Display feedback panel
  quizFeedbackBox.classList.remove('hidden');
  if (correct) {
    quizFeedbackBox.className = 'quiz-feedback-box correct';
    quizFeedbackText.innerHTML = `<strong>${TRANSLATIONS[lang]["correct"]}</strong> ${state.currentQuiz.explanation}`;
  } else {
    quizFeedbackBox.className = 'quiz-feedback-box wrong';
    quizFeedbackText.innerHTML = `<strong>${TRANSLATIONS[lang]["incorrect"]}</strong> ${state.currentQuiz.explanation}`;
  }

  // Hide the main submit button
  submitQuizBtn.classList.add('hidden');
  submitQuizBtn.style.display = 'none';
}

// --------------------------------------------------------------------------
// Settings Management: API key, Theme, Sidebar, Microphone
// --------------------------------------------------------------------------

// Toggle Sidebar View (Mobile Only)
function toggleSidebar(open) {
  if (open) {
    sidebarEl.classList.add('mobile-open');
  } else {
    sidebarEl.classList.remove('mobile-open');
  }
}



// Theme mode toggle
function toggleTheme() {
  state.theme = (state.theme === 'light') ? 'dark' : 'light';
  localStorage.setItem('kiwi_theme', state.theme);
  bodyEl.className = `theme-${state.theme}`;
  updateThemeButtonIcon();
}

function updateThemeButtonIcon() {
  if (state.theme === 'light') {
    themeModeBtn.innerHTML = '<i data-lucide="moon"></i>';
  } else {
    themeModeBtn.innerHTML = '<i data-lucide="sun"></i>';
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Microphone voice recognition (Web Speech API)
let recognition;
function startSpeechRecognition() {
  const lang = state.language;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    showToast(TRANSLATIONS[lang]["mic-error"], 'error');
    return;
  }

  if (recognition) {
    recognition.stop();
    recognition = null;
    voiceInputBtn.classList.remove('active');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = lang === 'he' ? 'he-IL' : 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    voiceInputBtn.classList.add('active');
    showToast(TRANSLATIONS[lang]["listening"], 'success');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userMessageInput.value = (userMessageInput.value + ' ' + transcript).trim();
    userMessageInput.dispatchEvent(new Event('input')); // trigger resize
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    showToast(TRANSLATIONS[lang]["mic-error"], 'error');
    voiceInputBtn.classList.remove('active');
    recognition = null;
  };

  recognition.onend = () => {
    voiceInputBtn.classList.remove('active');
    recognition = null;
  };

  recognition.start();
}

// Manual toggle of input textarea text direction (LTR vs RTL)
function toggleInputDirection() {
  const currentDir = userMessageInput.dir || 'ltr';
  const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
  userMessageInput.dir = newDir;
  
  if (newDir === 'rtl') {
    dirToggleBtn.classList.add('active');
    userMessageInput.style.textAlign = 'right';
  } else {
    dirToggleBtn.classList.remove('active');
    userMessageInput.style.textAlign = 'left';
  }
}

// Toast Alert display helper
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'warning') iconName = 'alert-triangle';
  if (type === 'error') iconName = 'x-circle';

  toast.innerHTML = `<i data-lucide="${iconName}" class="toast-icon"></i><span>${message}</span>`;
  toastContainer.appendChild(toast);
  
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Fade out and remove
  setTimeout(() => {
    toast.style.animation = 'toast-slide 0.3s reverse forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Line-by-line Markdown parsing
function parseMarkdown(text) {
  const lines = text.split('\n');
  let result = [];
  let inList = false;
  let inCodeBlock = false;
  let codeBlockContent = [];

  for (let line of lines) {
    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        result.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
        codeBlockContent = [];
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Escape HTML tags to prevent custom execution
    let processedLine = escapeHtml(line);

    // Inline formatting: Bold
    processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Inline formatting: Italic
    processedLine = processedLine.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Inline formatting: Code block
    processedLine = processedLine.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Handle lists
    const bulletMatch = processedLine.match(/^\s*[-*+]\s+(.*)/);
    const numberMatch = processedLine.match(/^\s*\d+\.\s+(.*)/);

    if (bulletMatch) {
      if (!inList) {
        result.push('<ul>');
        inList = 'ul';
      }
      result.push(`<li>${bulletMatch[1]}</li>`);
    } else if (numberMatch) {
      if (!inList) {
        result.push('<ol>');
        inList = 'ol';
      }
      result.push(`<li>${numberMatch[1]}</li>`);
    } else {
      if (inList) {
        result.push(inList === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }
      result.push(processedLine ? `<p>${processedLine}</p>` : '<br>');
    }
  }

  if (inList) {
    result.push(inList === 'ul' ? '</ul>' : '</ol>');
  }

  return result.join('\n');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// --------------------------------------------------------------------------
// Event Listeners Configuration
// --------------------------------------------------------------------------

// Mobile sidebar controls
mobileSidebarToggleBtn.onclick = () => toggleSidebar(true);
mobileSidebarCloseBtn.onclick = () => toggleSidebar(false);

// Language toggling events
langEnBtn.onclick = () => {
  if (state.language === 'en') return;
  state.language = 'en';
  localStorage.setItem('kiwi_lang', 'en');
  updateLanguageUI();
  resetChat(true);
  showToast('Switched to English', 'success');
};

langHeBtn.onclick = () => {
  if (state.language === 'he') return;
  state.language = 'he';
  localStorage.setItem('kiwi_lang', 'he');
  updateLanguageUI();
  resetChat(true);
  showToast('שונה לעברית', 'success');
};

// Subject cards events
subjectCards.forEach(card => {
  card.onclick = () => {
    const subjectVal = card.getAttribute('data-subject');
    if (state.subject === subjectVal) return;
    updateSubjectUI(subjectVal);
  };
});

// Grade selection events
gradeSelect.onchange = (e) => {
  const gradeVal = e.target.value;
  state.grade = gradeVal;
  localStorage.setItem('kiwi_grade', gradeVal);
  badgeGrade.textContent = getGradeTranslation(gradeVal);
  showToast(state.language === 'he' ? 'שלב החינוך עודכן' : `Grade level updated`, 'success');
  resetChat(true);
  loadFact();
  loadQuiz();
};



// Textarea auto-grow adjustment
userMessageInput.oninput = (e) => {
  e.target.style.height = 'auto';
  e.target.style.height = (e.target.scrollHeight - 6) + 'px';
};

// Textarea Enter key trigger
userMessageInput.onkeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleFormSubmit();
  }
};

// Main chat form submit
chatForm.onsubmit = (e) => {
  e.preventDefault();
  handleFormSubmit();
};

// Clear Chat button action
clearChatBtn.onclick = () => {
  const confirmMsg = state.language === 'he' 
    ? 'האם אתה בטוח שברצונך למחוק את היסטוריית השיחה?' 
    : 'Are you sure you want to clear the chat history?';
  
  if (confirm(confirmMsg)) {
    resetChat(true);
    showToast(TRANSLATIONS[state.language]["cleared-chat"], 'warning');
  }
};

// Theme toggle button action
themeModeBtn.onclick = toggleTheme;

// Voice recording triggers
voiceInputBtn.onclick = startSpeechRecognition;

// Manual input text direction toggle
dirToggleBtn.onclick = toggleInputDirection;

// Extra widgets button events
generateFactBtn.onclick = loadFact;
submitQuizBtn.onclick = handleQuizSubmit;
nextQuizBtn.onclick = loadQuiz;

// Lock screen logic
function showLockedOutState() {
  lockScreenError.textContent = "You are locked out.";
  lockScreenError.classList.remove('hidden');
  sitePasswordInput.disabled = true;
  lockScreenForm.querySelector('button').disabled = true;
}

if (lockScreenForm) {
  lockScreenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = sitePasswordInput.value;
    lockScreenError.classList.add('hidden');
    
    if (!userUid) return;

    try {
      const configRef = doc(db, 'config', 'security');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        const { sitePassword } = configSnap.data();
        
        if (password === sitePassword) {
          lockScreenContainer.classList.add('hidden');
          appContainer.style.display = 'flex';
        } else {
          lockScreenError.textContent = "Incorrect password.";
          lockScreenError.classList.remove('hidden');
          
          const lockoutRef = doc(db, 'lockouts', userUid);
          const lockoutSnap = await getDoc(lockoutRef);
          
          if (lockoutSnap.exists()) {
            const currentAttempts = lockoutSnap.data().attempts || 0;
            const newAttempts = currentAttempts + 1;
            const updates = { attempts: increment(1) };
            if (newAttempts >= 3) {
              updates.locked = true;
            }
            await updateDoc(lockoutRef, updates);
            
            if (newAttempts >= 3) {
              showLockedOutState();
            }
          } else {
            await setDoc(lockoutRef, { attempts: 1 });
          }
        }
      } else {
        lockScreenError.textContent = "Security config not found.";
        lockScreenError.classList.remove('hidden');
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      lockScreenError.textContent = "Error verifying password.";
      lockScreenError.classList.remove('hidden');
    }
  });
}

// Initialize app when window loads
window.onload = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userUid = user.uid;
      try {
        const lockoutRef = doc(db, 'lockouts', userUid);
        const lockoutSnap = await getDoc(lockoutRef);
        if (lockoutSnap.exists() && lockoutSnap.data().locked) {
          showLockedOutState();
        }
        
        // Initialize the app UI only once
        if (!window.appInitialized) {
          window.appInitialized = true;
          init();
        }
      } catch (error) {
        console.error("Error retrieving lockout state:", error);
      }
    } else {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Firebase Auth Error Full:", error);
        console.error("Firebase Auth Error Message:", error.message);
        console.error("Firebase Auth Error Code:", error.code);
        lockScreenError.textContent = "Error connecting to authentication server: " + (error.message || error);
        lockScreenError.classList.remove('hidden');
      }
    }
  });
};
