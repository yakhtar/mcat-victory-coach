// /public/js/flashcards.js
(() => {
  // ---------- SAFETY GUARDRAILS ----------
  if (window.__MCAT_VICTORY_ENABLE_FLASHCARDS === false) return;
  const MOUNT_ID = 'flashcards-app';
  const NS = 'mcatVictory.flashcards.v1';

  // ---------- DATA ADAPTER ----------
  // Input shape (example):
  // { id, topic, difficulty, type, question, options, correct_answer, explanation }
  // Output flashcard shape used by this component only:
  // { id, subject, tags, difficulty, front:{html}, back:{html} }
  function adaptToFlashcards(questions = []) {
    return questions.filter(q => {
      // Skip passage questions - too long for flashcards
      return q.type !== 'passage';
    }).filter(q => {
      // Only include questions with proper multiple choice options
      return q.options && Object.keys(q.options).length >= 2;
    }).map(q => {
      // Handle different question formats from our database
      const correctAnswer = q.correct_answer || q.answer || '';
      const options = q.options || {};
      const correctText = options[correctAnswer] || correctAnswer;
      const explanation = q.explanation || q.rationale || '';
      
      // Create simple front: question + options
      let frontHtml = `<div class="flashcard-question">${q.question || q.text || ''}</div>`;
      
      // Always show options clearly
      if (options && Object.keys(options).length > 0) {
        frontHtml += '<div class="flashcard-options">';
        Object.keys(options).sort().forEach(key => {
          frontHtml += `<div class="option"><strong>${key}.</strong> ${options[key]}</div>`;
        });
        frontHtml += '</div>';
      }
      
      // Create simple back: just the correct answer and brief explanation
      let backHtml = '';
      
      if (correctAnswer && correctText) {
        backHtml += `<div class="correct-answer">
          <div class="answer-highlight">✅ Answer: <strong>${correctAnswer}</strong></div>
          <div class="answer-text">"${correctText}"</div>
        </div>`;
      }
      
      // Keep explanation very short and simple
      if (explanation) {
        // Extract just the key concept, limit to 150 characters
        let keyExplanation = explanation;
        
        // Try to find the first sentence or main point
        const firstSentence = explanation.split('.')[0] + '.';
        if (firstSentence.length < 200 && firstSentence.length > 20) {
          keyExplanation = firstSentence;
        } else {
          // Fallback: just truncate
          keyExplanation = explanation.length > 150 ? 
            explanation.substring(0, 150) + '...' : explanation;
        }
        
        backHtml += `<div class="explanation">
          <strong>Why:</strong> ${keyExplanation}
        </div>`;
      }

      return {
        id: q.id ?? crypto.randomUUID(),
        subject: q.topic ?? 'General',
        tags: Array.isArray(q.tags) ? q.tags : [],
        difficulty: q.difficulty ?? 'foundation',
        front: { html: frontHtml },
        back: { html: backHtml }
      };
    });
  }

  // ---------- TOPIC MANAGEMENT ----------
  // Get unique topics from the database for dynamic dropdown
  async function getAvailableTopics() {
    try {
      const res = await fetch('/data/question-database.json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const questions = data.questions || [];
        
        // Get unique topics from questions
        const topics = new Set();
        questions.forEach(q => {
          if (q.topic) {
            topics.add(q.topic);
          }
        });
        
        // Convert to sorted array with display names
        const topicArray = Array.from(topics).sort().map(topic => ({
          value: topic,
          display: formatTopicDisplayName(topic)
        }));
        
        return topicArray;
      }
    } catch (e) {
      console.warn('[Flashcards] Could not fetch topics', e);
    }
    return [];
  }

  // Convert topic codes to readable names
  function formatTopicDisplayName(topic) {
    const topicMap = {
      'cell_biology': 'Cell Biology',
      'molecular_biology': 'Molecular Biology', 
      'evolution': 'Evolution',
      'genetics': 'Genetics',
      'biochemistry_integration': 'Biochemistry Integration',
      'organ_systems': 'Organ Systems',
      'atomic_structure': 'Atomic Structure',
      'chemical_bonding': 'Chemical Bonding',
      'thermodynamics': 'Thermodynamics',
      'kinetics': 'Kinetics',
      'equilibrium': 'Equilibrium',
      'acids_bases': 'Acids & Bases',
      'electrochemistry': 'Electrochemistry',
      'stoichiometry': 'Stoichiometry',
      'gas_properties': 'Gas Properties',
      'solution_chemistry': 'Solution Chemistry',
      'periodic_properties': 'Periodic Properties',
      'intermolecular_forces': 'Intermolecular Forces',
      'phase_changes': 'Phase Changes',
      'nuclear_chemistry': 'Nuclear Chemistry',
      'coordination_chemistry': 'Coordination Chemistry'
    };
    return topicMap[topic] || topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Populate topic dropdown dynamically
  async function populateTopicDropdown(selectElement) {
    const topics = await getAvailableTopics();
    
    // Clear existing options except "All Topics"
    const allTopicsOption = selectElement.querySelector('option[value="All Topics"]');
    selectElement.innerHTML = '';
    selectElement.appendChild(allTopicsOption);
    
    // Add available topics
    topics.forEach(topic => {
      const option = document.createElement('option');
      option.value = topic.value;
      option.textContent = topic.display;
      selectElement.appendChild(option);
    });
  }

  // ---------- DATA LOADER ----------
  // Non-breaking: tries in-memory first; falls back to JSON.
  async function loadQuestions({ subject = 'All Topics', tags = [], difficulty = 'All' } = {}) {
    let questions = [];

    // 1) Try to get questions from existing database
    try {
      const res = await fetch('/data/question-database.json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        questions = data.questions || [];
      }
    } catch (e) {
      console.warn('[Flashcards] Could not fetch question-database.json', e);
      questions = [];
    }

    // Lightweight filtering to match current UI expectations
    if (subject !== 'All Topics') {
      questions = questions.filter(q => (q.topic || q.subject) === subject);
    }
    if (difficulty !== 'All') {
      questions = questions.filter(q => (q.difficulty || 'foundation') === difficulty);
    }
    if (tags?.length) {
      questions = questions.filter(q => q.tags?.some(t => tags.includes(t)));
    }

    return adaptToFlashcards(questions);
  }

  // ---------- PERSISTENCE ----------
  const store = {
    key(subj) { return `${NS}:${subj || 'All'}`; },
    save(subj, data) { localStorage.setItem(store.key(subj), JSON.stringify(data)); },
    load(subj) {
      try { return JSON.parse(localStorage.getItem(store.key(subj)) || '{}'); }
      catch { return {}; }
    }
  };

  // ---------- RENDERING ----------
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function renderShell(mount) {
    mount.innerHTML = '';
    
    // Create EXACT copy of Interactive Flashcards HTML structure
    const html = `
      <!-- Enhanced Flashcard Controls (matching Interactive Flashcards) -->
      <div class="flex flex-wrap justify-center gap-4 mb-6">
        <select class="fc-subject px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Subject">
          <option value="All Topics">All Topics</option>
        </select>
        <select class="fc-difficulty px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Difficulty">
          <option value="All">All Levels</option>
          <option value="foundation">Foundation</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="elite">Elite</option>
        </select>
        <button class="fc-load-cards btn-medical-primary px-6 py-2">
          <i class="fas fa-magic mr-2"></i>Generate Cards
        </button>
      </div>
      
      <!-- Flashcard Display Area (EXACT copy of Interactive Flashcards structure) -->
      <div class="max-w-2xl mx-auto">
        <!-- Welcome state -->
        <div class="fc-welcome bg-white rounded-xl shadow-lg p-8 text-center border-2 border-dashed border-gray-300">
          <i class="fas fa-play-circle text-6xl text-blue-500 mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Ready to Start Learning</h3>
          <p class="text-gray-600">Select a subject and generate flashcards to begin your MCAT prep!</p>
        </div>
        
        <!-- Flashcard (EXACT structure from Interactive Flashcards) -->
        <div class="fc-card hidden bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-500" style="min-height: 300px;">
          <div class="card-hover relative">
            <!-- Card flip animation overlay -->
            <div class="fc-flip-overlay absolute inset-0 bg-blue-100 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
              <i class="fas fa-sync-alt text-2xl text-blue-600 animate-spin"></i>
            </div>
            
            <!-- Front of card (EXACT copy) -->
            <div class="fc-front p-8 cursor-pointer transform transition-transform duration-300 hover:scale-105">
              <div class="text-center">
                <div class="mb-4">
                  <span class="mcp-badge fc-subject-badge">Biology</span>
                  <span class="text-sm text-gray-500 ml-2 fc-progress">1 of 5</span>
                  <span class="text-xs text-gray-400 ml-2 fc-difficulty-display"></span>
                </div>
                <div class="fc-content text-xl font-medium mb-6 leading-relaxed"></div>
                <p class="text-sm text-gray-500 animate-pulse">
                  <i class="fas fa-mouse-pointer mr-1"></i>Click to reveal answer
                </p>
              </div>
            </div>
            
            <!-- Back of card (EXACT copy) -->
            <div class="fc-back hidden p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div class="fc-content text-lg mb-6 leading-relaxed"></div>
              
              <!-- Back to Question Button -->
              <div class="text-center mb-4">
                <button class="fc-flip-back px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                  <i class="fas fa-eye mr-1"></i>Show Question Again
                </button>
              </div>
              
              <!-- Simple Next Card Button -->
              <div class="text-center">
                <button class="fc-next px-6 py-2 btn-medical-primary">
                  Next Card <i class="fas fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Loading state -->
        <div class="fc-loading hidden bg-white rounded-xl shadow-lg p-8 text-center">
          <div class="loading mx-auto mb-4"></div>
          <p class="text-gray-600">Generating flashcards...</p>
        </div>
      </div>
      
      <!-- Progress indicator (EXACT copy) -->
      <div class="fc-progress-container hidden mt-6 max-w-2xl mx-auto">
        <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div class="fc-progress-bar bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500 relative" style="width: 0%">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
        <div class="flex justify-between items-center text-sm text-gray-600 mt-3">
          <span class="fc-progress-text">0 of 0 cards</span>
          <div class="flex gap-4">
            <span class="fc-confidence-stats text-xs"></span>
            <span class="fc-session-time">00:00</span>
          </div>
        </div>
        <div class="text-center mt-2">
          <button class="fc-prev px-3 py-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-sm mr-2 disabled:opacity-50">
            <i class="fas fa-chevron-left mr-1"></i>Previous
          </button>
          <button class="fc-next-nav px-3 py-1 btn-medical-primary text-sm">
            Next <i class="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    `;
    
    mount.innerHTML = html;
    
    // Elements created successfully

    return {
      progress: mount.querySelector('.fc-progress'),
      card: mount.querySelector('.fc-card'),
      welcome: mount.querySelector('.fc-welcome'),
      front: mount.querySelector('.fc-front .fc-content'),
      back: mount.querySelector('.fc-back .fc-content'),
      frontDiv: mount.querySelector('.fc-front'),
      backDiv: mount.querySelector('.fc-back'),
      btnFlipBack: mount.querySelector('.fc-flip-back'),
      btnPrev: mount.querySelector('.fc-prev'),
      btnNext: mount.querySelector('.fc-next'),
      btnNextNav: mount.querySelector('.fc-next-nav'),
      btnLoad: mount.querySelector('.fc-load-cards'),
      selSubject: mount.querySelector('.fc-subject'),
      selDifficulty: mount.querySelector('.fc-difficulty'),
      progressContainer: mount.querySelector('.fc-progress-container'),
      progressBar: mount.querySelector('.fc-progress-bar'),
      progressText: mount.querySelector('.fc-progress-text'),
      subjectBadge: mount.querySelector('.fc-subject-badge'),
      difficultyDisplay: mount.querySelector('.fc-difficulty-display'),
      flipOverlay: mount.querySelector('.fc-flip-overlay'),
      loading: mount.querySelector('.fc-loading'),
      confidenceStats: mount.querySelector('.fc-confidence-stats'),
      sessionTime: mount.querySelector('.fc-session-time')
    };
  }

  // ---------- DECK STATE ----------
  class FlashcardDeck {
    constructor({ mount, subject = 'All Topics' }) {
      this.mount = mount;
      this.subject = subject;
      this.difficulty = 'All';
      this.cards = [];
      this.index = 0;
      this.isFlipped = false;
      this.known = new Set();
      this.unknown = new Set();
      this.ui = renderShell(mount);
      this.bound = false;
    }

    bind() {
      if (this.bound) return;
      this.bound = true;

      // Binding event handlers

      // Load cards handler
      if (this.ui.btnLoad) {
        this.ui.btnLoad.addEventListener('click', async () => {
          await this.reload();
        });
      }

      // Flip functionality (EXACT copy of Interactive Flashcards logic)
      const flip = () => {
        if (!this.ui.frontDiv || !this.ui.backDiv) {
          console.error('Card elements not found');
          return;
        }
        
        // Show flip animation
        if (this.ui.flipOverlay) {
          this.ui.flipOverlay.style.opacity = '1';
          setTimeout(() => {
            this.ui.flipOverlay.style.opacity = '0';
          }, 300);
        }
        
        const isBackVisible = !this.ui.backDiv.classList.contains('hidden');
        
        if (isBackVisible) {
          // Show front, hide back (flip to question)
          this.ui.backDiv.classList.add('hidden');
          this.ui.frontDiv.classList.remove('hidden');
          this.isFlipped = false;
        } else {
          // Show back, hide front (flip to answer)
          this.ui.frontDiv.classList.add('hidden');
          this.ui.backDiv.classList.remove('hidden');
          this.isFlipped = true;
        }
      };
      
      // Click to flip (front card)
      if (this.ui.frontDiv) {
        this.ui.frontDiv.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          flip();
        });
      }
      
      // "Show Question Again" button (back card)
      if (this.ui.btnFlipBack) {
        this.ui.btnFlipBack.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          flip();
        });
      }

      // Navigation buttons
      if (this.ui.btnNext) this.ui.btnNext.addEventListener('click', () => this.next());
      if (this.ui.btnNextNav) this.ui.btnNextNav.addEventListener('click', () => this.next());
      if (this.ui.btnPrev) this.ui.btnPrev.addEventListener('click', () => this.prev());

      // subject/difficulty filter changes
      if (this.ui.selSubject) {
        this.ui.selSubject.addEventListener('change', () => {
          this.subject = this.ui.selSubject.value;
        });
      }

      if (this.ui.selDifficulty) {
        this.ui.selDifficulty.addEventListener('change', () => {
          this.difficulty = this.ui.selDifficulty.value;
        });
      }
    }

    async reload() {
      // Populate dropdown with available topics first
      await populateTopicDropdown(this.ui.selSubject);
      
      const data = await loadQuestions({ 
        subject: this.subject, 
        difficulty: this.difficulty 
      });
      this.cards = data;
      this.index = 0;
      
      // restore progress
      const saved = store.load(`${this.subject}-${this.difficulty}`);
      if (saved?.knownIds) this.known = new Set(saved.knownIds);
      if (saved?.unknownIds) this.unknown = new Set(saved.unknownIds);
      
      this.render();
    }

    current() { return this.cards[this.index]; }

    next() {
      if (this.cards.length === 0) return;
      this.index = (this.index + 1) % this.cards.length;
      this.render();
    }

    prev() {
      if (this.cards.length === 0) return;
      this.index = (this.index - 1 + this.cards.length) % this.cards.length;
      this.render();
    }

    mark(isKnown) {
      const cur = this.current();
      if (!cur) return;
      
      this.known.delete(cur.id);
      this.unknown.delete(cur.id);
      (isKnown ? this.known : this.unknown).add(cur.id);

      // persist
      store.save(`${this.subject}-${this.difficulty}`, {
        knownIds: [...this.known],
        unknownIds: [...this.unknown]
      });

      // auto-advance to next card
      this.next();
    }

    render() {
      const cur = this.current();
      const total = this.cards.length;
      const n = total ? (this.index + 1) : 0;
      const progressText = `${n} / ${total}`;
      
      // Update progress text in all locations
      const progressElements = document.querySelectorAll('#flashcards-app .fc-progress');
      progressElements.forEach(el => {
        if (el) el.textContent = progressText;
      });
      
      // Update progress bar
      if (this.ui.progressBar && total > 0) {
        const percentage = (n / total) * 100;
        this.ui.progressBar.style.width = `${percentage}%`;
      }
      
      // Update progress text
      if (this.ui.progressText) {
        this.ui.progressText.textContent = `${n} of ${total} cards`;
      }

      if (!cur) {
        if (this.ui.welcome) this.ui.welcome.classList.remove('hidden');
        if (this.ui.card) this.ui.card.classList.add('hidden');
        if (this.ui.progressContainer) this.ui.progressContainer.classList.add('hidden');
        return;
      }

      // Show card and progress, hide welcome
      if (this.ui.welcome) this.ui.welcome.classList.add('hidden');
      if (this.ui.card) this.ui.card.classList.remove('hidden');
      if (this.ui.progressContainer) this.ui.progressContainer.classList.remove('hidden');

      // CRITICAL: Reset flip state when showing new card (like Interactive Flashcards)
      this.isFlipped = false;
      
      // Show front side by default, hide back
      if (this.ui.frontDiv) this.ui.frontDiv.classList.remove('hidden');
      if (this.ui.backDiv) this.ui.backDiv.classList.add('hidden');

      // Update card content
      if (this.ui.front) {
        this.ui.front.innerHTML = cur.front.html || '';
      }
      if (this.ui.back) {
        this.ui.back.innerHTML = cur.back.html || '';
      }
      
      // Update subject badge
      if (this.ui.subjectBadge) {
        this.ui.subjectBadge.textContent = cur.subject || 'Biology';
      }
      
      // Update difficulty display
      if (this.ui.difficultyDisplay) {
        const difficultyMap = {
          'foundation': 'Foundation',
          'intermediate': 'Intermediate', 
          'advanced': 'Advanced',
          'elite': 'Elite'
        };
        this.ui.difficultyDisplay.textContent = difficultyMap[cur.difficulty] || cur.difficulty;
      }
    }
  }

  // ---------- PUBLIC ENTRY ----------
  async function initFlashcards({ subject = 'All Topics' } = {}) {
    const mount = document.getElementById(MOUNT_ID);
    if (!mount) return; // Respect page where flashcards aren't present
    
    const deck = new FlashcardDeck({ mount, subject });
    deck.bind();
    await deck.reload(); // Load initial cards
    
    return deck; // optional: expose for debugging
  }

  // Expose safely under namespace
  window.MCATVictory = Object.assign({}, window.MCATVictory, {
    Flashcards: { init: initFlashcards, adaptToFlashcards, loadQuestions }
  });

  // Auto-init if mount exists
  document.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById(MOUNT_ID);
    if (mount) {
      initFlashcards().catch(err => {
        console.error('Enhanced Study Flashcards initialization failed', err);
      });
    }
  });
})();