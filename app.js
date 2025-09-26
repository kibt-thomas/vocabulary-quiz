document.addEventListener('DOMContentLoaded', () => {
    const app = (() => {
        const APP_VERSION = '1.0.3';

        const SUPPORTED_LANGUAGES = [
            { code: 'en-US', name: 'English' },
            { code: 'de-DE', name: 'German' },
            { code: 'it-IT', name: 'Italian' },
            { code: 'fr-FR', name: 'French' },
            { code: 'es-ES', name: 'Spanish' },
        ];

        const DOM = {
            navToggleBtn: document.getElementById('nav-toggle-btn'),
            navAvatarInitial: document.getElementById('nav-avatar-initial'),
            navMenu: document.getElementById('nav-menu'),
            navLinks: document.querySelectorAll('.nav-link'),
            pages: document.querySelectorAll('.page'),
            modalOverlay: document.getElementById('modal-overlay'),
            quizSetupView: document.getElementById('quiz-setup-view'),
            quizSection: document.getElementById('quiz-section'),
            quizFeedbackView: document.getElementById('quiz-feedback-view'),
            headerQuizBtn: document.getElementById('header-quiz-btn'),
            mainPageNickname: document.getElementById('main-page-nickname'),
            goToQuizSetupBtn: document.getElementById('go-to-quiz-setup-btn'),
            quizSuggestionsContainer: document.getElementById('quiz-suggestions'),
            addCardForm: document.getElementById('add-card-form'),
            lectureInput: document.getElementById('lecture'),
            nativeWordInput: document.getElementById('english-word'),
            nativeWordLabel: document.querySelector('label[for="english-word"]'),
            foreignWordInput: document.getElementById('german-word'),
            foreignWordLabel: document.querySelector('label[for="german-word"]'),
            importBtn: document.getElementById('import-btn'),
            importFileInput: document.getElementById('import-file-input'),
            exportBtn: document.getElementById('export-btn'),
            cardListEl: document.getElementById('card-list'),
            cardCountEl: document.getElementById('card-count'),
            statsTableBody: document.getElementById('stats-table-body'),
            historyListEl: document.getElementById('history-list'),
            quizLectureFilter: document.getElementById('quiz-lecture-filter'),
            startQuizBtn: document.getElementById('start-quiz-btn'),
            backToMainBtn: document.getElementById('back-to-main-btn'),
            progressBar: document.getElementById('progress-bar'),
            progressText: document.getElementById('progress-text'),
            quizReason: document.getElementById('quiz-reason'),
            quizWord: document.getElementById('quiz-word'),
            speakQuestionBtn: document.getElementById('speak-question-btn'),
            quizPromptText: document.getElementById('quiz-prompt-text'),
            quizInputArea: document.getElementById('quiz-input-area'),
            typingInputContainer: document.getElementById('typing-input-container'),
            choiceInputContainer: document.getElementById('choice-input-container'),
            speechInputContainer: document.getElementById('speech-input-container'),
            answerInput: document.getElementById('answer-input'),
            checkAnswerBtn: document.getElementById('check-answer-btn'),
            listenBtn: document.getElementById('listen-btn'),
            listenBtnText: document.getElementById('listen-btn-text'),
            speechStatus: document.getElementById('speech-recognition-status'),
            resultArea: document.getElementById('result-area'),
            resultText: document.getElementById('result-text'),
            correctAnswerText: document.getElementById('correct-answer-text'),
            speakBtn: document.getElementById('speak-btn'),
            nextQuestionBtn: document.getElementById('next-question-btn'),
            endQuizBtn: document.getElementById('end-quiz-btn'),
            feedbackMessage: document.getElementById('feedback-message'),
            feedbackCorrect: document.getElementById('feedback-correct'),
            feedbackTotal: document.getElementById('feedback-total'),
            feedbackStars: document.getElementById('feedback-stars'),
            backToHubBtn: document.getElementById('back-to-hub-btn'),
            saveSettingsBtn: document.getElementById('save-settings-btn'),
            nicknameInput: document.getElementById('nickname-input'),
            themeSelect: document.getElementById('theme-select'),
            nativeLangSelect: document.getElementById('native-lang-select'),
            foreignLangSelect: document.getElementById('foreign-lang-select'),
            autoAdvanceCorrectTime: document.getElementById('auto-advance-correct-time'),
            autoAdvanceWrongTime: document.getElementById('auto-advance-wrong-time'),
            maxQuizQuestions: document.getElementById('max-quiz-questions'),
            repeatAfterInput: document.getElementById('repeat-after-input'),
            bin1Slider: document.getElementById('bin1-threshold'),
            bin2Slider: document.getElementById('bin2-threshold'),
            bin3Slider: document.getElementById('bin3-threshold'),
            bin1Label: document.getElementById('bin1-label'),
            bin2Label: document.getElementById('bin2-label'),
            bin3Label: document.getElementById('bin3-label'),
            quizDirectionLabels: {
                nativeToForeign: document.querySelector('label[for="dir-en-de"]'),
                foreignToNative: document.querySelector('label[for="dir-de-en"]'),
            },
            modeSpeech: document.getElementById('mode-speech'),
            footerVersion: document.querySelector('footer p'),
        };
        
        const State = {
            flashcards: [],
            quizHistory: [],
            quizQueue: [],
            currentCard: null,
            quizSettings: { 
                lecture: 'all', 
                fromLang: null,
                toLang: null,
                mode: 'choice',
                isMixed: false,
            },
            quizSessionStats: { correct: 0, presented: 0, initialQueueLength: 0 },
            autoAdvanceTimer: null,
            settings: {},
            isListening: false,
        };
        
        const UI = {
            showPage(pageId) {
                DOM.pages.forEach(p => p.classList.toggle('active', p.id === pageId));
                DOM.navMenu.classList.add('hidden');
                
                if (pageId === 'list-page') this.updateCardList();
                if (pageId === 'stats-page') this.updateStatsTable();
                if (pageId === 'history-page') this.updateHistoryPage();
                if (pageId === 'main-page') this.updateQuizSuggestions();
                if (pageId === 'settings-page') this.updateSettingsPage();
            },
            showModal(modalElement) {
                DOM.modalOverlay.classList.remove('hidden');
                modalElement.classList.remove('hidden');
                document.body.classList.add('modal-open');
            },
            hideModal(modalElement) {
                DOM.modalOverlay.classList.add('hidden');
                modalElement.classList.add('hidden');
                document.body.classList.remove('modal-open');
            },
            showToast(message, isError = false) {
                const toast = document.getElementById('toast');
                const toastMessage = document.getElementById('toast-message');
                toastMessage.textContent = message;
                toast.classList.toggle('bg-red-600', isError);
                toast.classList.toggle('bg-slate-800', !isError);
                toast.classList.add('show');
                setTimeout(() => { toast.classList.remove('show'); }, 3000);
            },
            applySettings() {
                document.body.className = `theme-${State.settings.theme} bg-slate-100 text-slate-800 flex flex-col items-center min-h-screen p-4`;
                DOM.mainPageNickname.textContent = State.settings.nickname;
                DOM.navAvatarInitial.textContent = State.settings.nickname ? State.settings.nickname.charAt(0).toUpperCase() : '?';
                this.updateDynamicLabels();
            },
            updateDynamicLabels() {
                const nativeLangName = SUPPORTED_LANGUAGES.find(l => l.code === State.settings.nativeLangCode)?.name || 'Native';
                const foreignLangName = SUPPORTED_LANGUAGES.find(l => l.code === State.settings.foreignLangCode)?.name || 'Foreign';
                
                DOM.nativeWordLabel.textContent = nativeLangName;
                DOM.nativeWordInput.placeholder = `Enter ${nativeLangName} phrase...`;
                DOM.foreignWordLabel.textContent = foreignLangName;
                DOM.foreignWordInput.placeholder = `Enter ${foreignLangName} phrase...`;

                DOM.quizDirectionLabels.nativeToForeign.textContent = `${nativeLangName} → ${foreignLangName}`;
                DOM.quizDirectionLabels.foreignToNative.textContent = `${foreignLangName} → ${nativeLangName}`;
            },
            populateLanguageSelectors() {
                [DOM.nativeLangSelect, DOM.foreignLangSelect].forEach(select => {
                    select.innerHTML = '';
                    SUPPORTED_LANGUAGES.forEach(lang => {
                        const option = new Option(lang.name, lang.code);
                        select.add(option);
                    });
                });
            },
            updateSettingsPage() {
                DOM.nicknameInput.value = State.settings.nickname;
                DOM.themeSelect.value = State.settings.theme;
                DOM.nativeLangSelect.value = State.settings.nativeLangCode;
                DOM.foreignLangSelect.value = State.settings.foreignLangCode;
                DOM.autoAdvanceCorrectTime.value = State.settings.autoAdvanceCorrect;
                DOM.autoAdvanceWrongTime.value = State.settings.autoAdvanceWrong;
                DOM.maxQuizQuestions.value = State.settings.maxQuestions;
                DOM.repeatAfterInput.value = State.settings.repeatAfter;
                DOM.bin1Slider.value = State.settings.binThresholds.p1;
                DOM.bin2Slider.value = State.settings.binThresholds.p2;
                DOM.bin3Slider.value = State.settings.binThresholds.p3;
                this.updateBinSliderLabelsAndConstraints();
            },
            updateBinSliderLabelsAndConstraints(){
                const p1 = parseInt(DOM.bin1Slider.value, 10);
                const p2 = parseInt(DOM.bin2Slider.value, 10);
                const p3 = parseInt(DOM.bin3Slider.value, 10);

                DOM.bin1Label.textContent = `0-${p1}%`;
                DOM.bin2Label.textContent = `${p1}-${p2}%`;
                DOM.bin3Label.textContent = `${p2}-${p3}%`;

                DOM.bin2Slider.min = p1 + 1;
                DOM.bin3Slider.min = p2 + 1;
                DOM.bin1Slider.max = p2 - 1;
                DOM.bin2Slider.max = p3 - 1;
            },
            getStarsHTML(percentage) {
                let filledStars = 0;
                if (percentage >= 95) filledStars = 5;
                else if (percentage >= 80) filledStars = 4;
                else if (percentage >= 60) filledStars = 3;
                else if (percentage >= 40) filledStars = 2;
                else if (percentage >= 20) filledStars = 1;
                
                let starsHTML = '';
                for (let i = 0; i < 5; i++) {
                    starsHTML += i < filledStars ? '<span class="filled">★</span>' : '★';
                }
                return `<span class="star-rating">${starsHTML}</span>`;
            },
            updateCardList() {
                const { nativeLangCode, foreignLangCode } = State.settings;
                const filteredCards = State.flashcards.filter(c => c.translations[nativeLangCode] && c.translations[foreignLangCode]);
                DOM.cardCountEl.textContent = filteredCards.length;

                const lectures = filteredCards.reduce((acc, card) => {
                    (acc[card.lecture] = acc[card.lecture] || []).push(card);
                    return acc;
                }, {});

                DOM.cardListEl.innerHTML = '';
                if (Object.keys(lectures).length > 0) {
                    Object.keys(lectures).sort().forEach(lecture => {
                        const lectureGroup = document.createElement('div');
                        lectureGroup.innerHTML = `<h3 class="font-semibold text-slate-600 border-b pb-1 mb-2">${lecture}</h3>`;
                        lectures[lecture].forEach(card => {
                             const cardEl = document.createElement('div');
                             cardEl.className = 'flex justify-between items-start bg-slate-50 p-2 rounded-lg';
                             const bin = Quiz.getBinForCard(card);
                             cardEl.innerHTML = `
                                 <div class="flex-grow">
                                     <p class="text-sm font-medium text-slate-800"><b>${card.translations[nativeLangCode]}</b></p>
                                     <div class="flex items-center gap-1">
                                         <p class="text-sm text-slate-500">/ ${card.translations[foreignLangCode]}</p>
                                         <button data-speak-text="${card.translations[foreignLangCode]}" data-speak-lang="${foreignLangCode}" class="speak-list-btn p-1 rounded-full hover:bg-slate-200">
                                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-slate-500"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                         </button>
                                     </div>
                                 </div>
                                 <div class="flex flex-col items-end">
                                     <span class="text-xs font-bold text-white ${bin.color} px-2 py-0.5 rounded-full mb-2">${bin.label}</span>
                                     <button data-id="${card.id}" class="delete-btn text-red-400 hover:text-red-600 p-1 text-xl leading-none">&times;</button>
                                 </div>`;
                             lectureGroup.appendChild(cardEl);
                        });
                        DOM.cardListEl.appendChild(lectureGroup);
                    });
                } else {
                    DOM.cardListEl.innerHTML = '<p class="text-sm text-slate-500">No phrases found for the selected language pair. Add some!</p>';
                }
            },
            updateQuizLectureFilter() {
                 const { nativeLangCode, foreignLangCode } = State.settings;
                 const lectures = [...new Set(State.flashcards
                    .filter(c => c.translations[nativeLangCode] && c.translations[foreignLangCode])
                    .map(c => c.lecture))];
                 DOM.quizLectureFilter.innerHTML = '<option value="all">All Phrases</option>';
                 lectures.sort().forEach(l => DOM.quizLectureFilter.appendChild(new Option(l, l)));
            },
            updateStatsTable() {
                const stats = {};
                State.flashcards.forEach(card => {
                    Object.entries(card.scores || {}).forEach(([pairKey, modes]) => {
                        const [from, to] = pairKey.split('_');
                        const fromName = SUPPORTED_LANGUAGES.find(l=>l.code === from)?.name.substring(0,2).toUpperCase() || '??';
                        const toName = SUPPORTED_LANGUAGES.find(l=>l.code === to)?.name.substring(0,2).toUpperCase() || '??';
                        Object.entries(modes).forEach(([mode, data]) => {
                            const key = `${fromName}→${toName} ${mode}`;
                            if (!stats[key]) stats[key] = { name: key, c: 0, i: 0 };
                            stats[key].c += data.correct;
                            stats[key].i += data.incorrect;
                        });
                    });
                });
                DOM.statsTableBody.innerHTML = Object.values(stats).map(s => {
                    const total = s.c + s.i;
                    const rate = total > 0 ? `${((s.c/total)*100).toFixed(0)}%` : 'N/A';
                    return `<tr class="bg-white border-b"><th class="px-4 py-3 font-medium text-slate-900">${s.name}</th><td class="px-4 py-3 text-center text-green-600">${s.c}</td><td class="px-4 py-3 text-center text-red-600">${s.i}</td><td class="px-4 py-3 text-center">${rate}</td></tr>`;
                }).join('');
            },
            updateHistoryPage() {
                 if (State.quizHistory.length === 0) {
                    DOM.historyListEl.innerHTML = '<p class="text-slate-500 text-sm">Your quiz history will appear here.</p>';
                    return;
                }
                DOM.historyListEl.innerHTML = State.quizHistory.map(item => {
                    const date = new Date(item.date).toLocaleString();
                    const fromName = SUPPORTED_LANGUAGES.find(l => l.code === item.fromLang)?.name;
                    const toName = SUPPORTED_LANGUAGES.find(l => l.code === item.toLang)?.name;
                    const direction = item.isMixed ? `Mixed (${fromName}/${toName})` : `${fromName} → ${toName}`;
                    const percentage = item.presented > 0 ? (item.correct / item.presented) * 100 : 0;
                    return `
                        <div class="bg-slate-50 p-3 rounded-lg">
                            <div class="flex justify-between items-center">
                                <p class="font-semibold">${item.lecture}</p>
                                <div class="text-lg">${this.getStarsHTML(percentage)}</div>
                            </div>
                            <div class="flex justify-between items-center text-sm text-slate-500 mt-1">
                                <span>${direction} (${item.mode})</span>
                                <span class="font-bold">${item.correct}/${item.presented}</span>
                            </div>
                             <div class="text-xs text-slate-400 text-right mt-1">${date}</div>
                        </div>`;
                }).join('');
            },
            updateQuizSuggestions() {
                DOM.quizSuggestionsContainer.innerHTML = '';
                const { nativeLangCode, foreignLangCode } = State.settings;
                const lectureStats = {};
                State.flashcards
                    .filter(c => c.translations[nativeLangCode] && c.translations[foreignLangCode])
                    .forEach(card => {
                        if (!lectureStats[card.lecture]) {
                            lectureStats[card.lecture] = { attempts: 0, correct: 0 };
                        }
                        const scoreKey = `${nativeLangCode}_${foreignLangCode}`;
                        const scoreKeyRev = `${foreignLangCode}_${nativeLangCode}`;
                        [scoreKey, scoreKeyRev].forEach(key => {
                            if (card.scores && card.scores[key]) {
                                Object.values(card.scores[key]).forEach(mode => {
                                    lectureStats[card.lecture].attempts += mode.correct + mode.incorrect;
                                    lectureStats[card.lecture].correct += mode.correct;
                                });
                            }
                        });
                    });

                const suggestions = [];
                const sortedByAttempts = Object.entries(lectureStats).sort((a, b) => a[1].attempts - b[1].attempts);
                if (sortedByAttempts.length > 0) {
                    suggestions.push({ lecture: sortedByAttempts[0][0], reason: `Least practiced (${sortedByAttempts[0][1].attempts} attempts)` });
                }

                const sortedByRate = Object.entries(lectureStats)
                    .filter(([, stats]) => stats.attempts > 5)
                    .sort((a, b) => (a[1].correct / a[1].attempts) - (b[1].correct / b[1].attempts));
                
                if (sortedByRate.length > 0 && (suggestions.length === 0 || sortedByRate[0][0] !== suggestions[0].lecture)) {
                    const rate = (sortedByRate[0][1].correct / sortedByRate[0][1].attempts * 100).toFixed(0);
                    suggestions.push({ lecture: sortedByRate[0][0], reason: `Lowest success rate (${rate}%)` });
                }

                if (suggestions.length > 0) {
                    DOM.quizSuggestionsContainer.innerHTML = suggestions.slice(0, 3).map(s => 
                        `<button data-lecture="${s.lecture}" class="direct-start-btn w-full text-left p-3 border rounded-lg hover:bg-slate-50">
                            <p class="font-semibold">${s.lecture}</p>
                            <p class="text-sm text-slate-500">${s.reason}</p>
                        </button>`
                    ).join('');
                } else {
                    DOM.quizSuggestionsContainer.innerHTML = '<p class="text-sm text-slate-500">Practice a bit more to get smart suggestions!</p>';
                }
            },
        };

        const Quiz = {
            shuffle: (array) => {
                const newArr = [...array];
                for (let i = newArr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
                }
                return newArr;
            },
            getScore(card, fromLang, toLang, mode) {
                const scoreKey = `${fromLang}_${toLang}`;
                return card.scores?.[scoreKey]?.[mode] || { correct: 0, incorrect: 0, lastTrained: null };
            },
            getBinForCard(card) {
                const allScores = Object.values(card.scores || {}).flatMap(Object.values);
                const { correct, incorrect } = allScores.reduce((acc, s) => ({ correct: acc.correct + s.correct, incorrect: acc.incorrect + s.incorrect }), { correct: 0, incorrect: 0 });
                const total = correct + incorrect;
                if (total === 0) return { label: 'New', color: 'bg-slate-400' };
                const rate = correct / total;
                const { p1, p2, p3 } = State.settings.binThresholds;
                if (rate < p1 / 100) return { label: `Practice`, color: 'bg-red-500' };
                if (rate < p2 / 100) return { label: `Getting There`, color: 'bg-orange-500' };
                if (rate < p3 / 100) return { label: `Good`, color: 'bg-yellow-500' };
                return { label: `Mastered`, color: 'bg-green-500' };
            },
            initiate(lecture, direction, mode) {
                State.quizSettings.lecture = lecture;
                State.quizSettings.mode = mode;
                State.quizSettings.isMixed = direction === 'mixed';
                
                if (direction === 'native-to-foreign' || direction === 'mixed') {
                    State.quizSettings.fromLang = State.settings.nativeLangCode;
                    State.quizSettings.toLang = State.settings.foreignLangCode;
                } else { // foreign-to-native
                    State.quizSettings.fromLang = State.settings.foreignLangCode;
                    State.quizSettings.toLang = State.settings.nativeLangCode;
                }
                
                const { fromLang, toLang } = State.quizSettings;
                const relevantCards = State.flashcards.filter(c => 
                    (lecture === 'all' || c.lecture === lecture) &&
                    c.translations[fromLang] && c.translations[toLang]
                );

                if (relevantCards.length < (mode === 'choice' ? 4 : 1)) {
                    UI.showToast(`Not enough phrases for this quiz (need at least ${mode === 'choice' ? 4 : 1}).`, true);
                    return;
                }
                
                State.quizQueue = this.shuffle(relevantCards);
                State.quizSessionStats = { correct: 0, presented: 0, initialQueueLength: State.quizQueue.length };
                UI.hideModal(DOM.quizSetupView);
                UI.showModal(DOM.quizSection);
                this.loadNextQuestion();
            },
            loadNextQuestion() {
                clearTimeout(State.autoAdvanceTimer);
                if (State.quizQueue.length === 0 || State.quizSessionStats.presented >= State.settings.maxQuestions) {
                    DOM.endQuizBtn.click();
                    return;
                }

                State.currentCard = State.quizQueue.shift();
                State.quizSessionStats.presented++;
                
                let { fromLang, toLang, isMixed, mode } = State.quizSettings;
                if (isMixed && Math.random() < 0.5) { [fromLang, toLang] = [toLang, fromLang]; }
                
                State.currentCard.currentFromLang = fromLang;
                State.currentCard.currentToLang = toLang;

                const card = State.currentCard;
                card.question = card.translations[fromLang];
                card.answer = card.translations[toLang];

                const toLangName = SUPPORTED_LANGUAGES.find(l => l.code === toLang)?.name;
                DOM.quizWord.textContent = card.question;
                DOM.quizPromptText.textContent = `What is the ${toLangName} translation?`;
                const totalQuestions = Math.min(State.quizSessionStats.initialQueueLength, State.settings.maxQuestions);
                DOM.progressBar.style.width = `${(State.quizSessionStats.presented / totalQuestions) * 100}%`;
                DOM.progressText.textContent = `${State.quizSessionStats.presented} / ${totalQuestions}`;
                DOM.speakQuestionBtn.classList.add('hidden');

                if (fromLang === State.settings.foreignLangCode) {
                    Speech.speak(card.question, fromLang);
                    DOM.speakQuestionBtn.classList.remove('hidden');
                }

                DOM.resultArea.classList.add('hidden');
                DOM.quizInputArea.classList.remove('hidden');
                DOM.typingInputContainer.classList.add('hidden');
                DOM.choiceInputContainer.classList.add('hidden');
                DOM.speechInputContainer.classList.add('hidden');

                if (mode === 'typing') {
                    DOM.typingInputContainer.classList.remove('hidden');
                    DOM.answerInput.value = '';
                    DOM.answerInput.focus();
                } else if (mode === 'choice') {
                    DOM.choiceInputContainer.classList.remove('hidden');
                    let options = [card.answer];
                    const wrongAnswers = this.shuffle(State.flashcards
                        .filter(c => c.id !== card.id && c.translations[toLang])
                        .map(c => c.translations[toLang]));
                    while (options.length < 4 && wrongAnswers.length > 0) {
                        const wrong = wrongAnswers.pop();
                        if (!options.includes(wrong)) options.push(wrong);
                    }
                    DOM.choiceInputContainer.innerHTML = this.shuffle(options).map(opt => `<button class="choice-btn w-full text-left p-3 border rounded-lg hover:bg-slate-100">${opt}</button>`).join('');
                } else if (mode === 'speech') {
                    DOM.speechInputContainer.classList.remove('hidden');
                }
            },
            checkAnswer(userAnswer) {
                clearTimeout(State.autoAdvanceTimer);
                const { currentCard, quizSettings } = State;
                const isCorrect = userAnswer.trim().toLowerCase() === currentCard.answer.toLowerCase();
                
                const cardInDb = State.flashcards.find(c => c.id === currentCard.id);
                if (cardInDb) {
                    const scoreKey = `${currentCard.currentFromLang}_${currentCard.currentToLang}`;
                    if (!cardInDb.scores) cardInDb.scores = {};
                    if (!cardInDb.scores[scoreKey]) cardInDb.scores[scoreKey] = {};
                    if (!cardInDb.scores[scoreKey][quizSettings.mode]) cardInDb.scores[scoreKey][quizSettings.mode] = Data.defaultScore();
                    
                    const s = cardInDb.scores[scoreKey][quizSettings.mode];
                    if (isCorrect) {
                        s.correct++;
                        State.quizSessionStats.correct++;
                    } else {
                        s.incorrect++;
                        const repeatCard = { ...currentCard, isRepeat: true };
                        State.quizQueue.splice(State.settings.repeatAfter - 1, 0, repeatCard);
                    }
                    s.lastTrained = new Date().toISOString();
                    Data.saveFlashcards();
                }

                DOM.resultArea.classList.remove('hidden');
                DOM.quizInputArea.classList.add('hidden');
                DOM.resultText.textContent = isCorrect ? 'Correct!' : 'Not quite!';
                DOM.resultArea.className = `text-center mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
                DOM.correctAnswerText.innerHTML = `The answer is <b>"${currentCard.answer}"</b>.`;
                DOM.speakBtn.dataset.speakText = currentCard.answer;
                DOM.speakBtn.dataset.speakLang = currentCard.currentToLang;

                const startTimer = () => {
                    const delay = (isCorrect ? State.settings.autoAdvanceCorrect : State.settings.autoAdvanceWrong) * 1000;
                    if (delay >= 0) State.autoAdvanceTimer = setTimeout(() => this.loadNextQuestion(), delay);
                };
                
                if (isCorrect && currentCard.currentToLang === State.settings.foreignLangCode) {
                    Speech.speak(currentCard.answer, currentCard.currentToLang, startTimer);
                } else {
                    startTimer();
                }
            },
            showFeedback() {
                const { correct, presented, initialQueueLength } = State.quizSessionStats;
                const totalQuestions = Math.min(initialQueueLength, State.settings.maxQuestions);

                const historyEntry = {
                    date: new Date().toISOString(),
                    lecture: State.quizSettings.lecture,
                    fromLang: State.quizSettings.fromLang,
                    toLang: State.quizSettings.toLang,
                    isMixed: State.quizSettings.isMixed,
                    mode: State.quizSettings.mode,
                    correct,
                    presented,
                    id: Date.now()
                };
                Data.saveQuizHistory(historyEntry);

                const percentage = presented > 0 ? (correct / presented) * 100 : 0;
                DOM.feedbackCorrect.textContent = correct;
                DOM.feedbackTotal.textContent = totalQuestions;
                DOM.feedbackStars.innerHTML = UI.getStarsHTML(percentage);
                let message = `Keep Studying, ${State.settings.nickname}! Every attempt helps.`;
                if(percentage >= 95) message = `Outstanding, ${State.settings.nickname}!`;
                else if (percentage >= 80) message = `Great Job, ${State.settings.nickname}!`;
                else if (percentage >= 60) message = `Good Effort, ${State.settings.nickname}!`;
                else if (percentage >= 40) message = `Nice Try, ${State.settings.nickname}!`;
                DOM.feedbackMessage.textContent = message;

                UI.showModal(DOM.quizFeedbackView);
            }
        };

        const Speech = {
            synth: window.speechSynthesis,
            recognition: null,
            init() {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    DOM.modeSpeech.disabled = true;
                    document.querySelector('label[for="mode-speech"]').classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    this.recognition = new SpeechRecognition();
                    this.recognition.continuous = false;
                    this.recognition.interimResults = false;
                    this.recognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        DOM.speechStatus.textContent = `You said: "${transcript}"`;
                        Quiz.checkAnswer(transcript);
                        State.isListening = false;
                        DOM.listenBtnText.textContent = 'Start Listening';
                    };
                    this.recognition.onerror = (event) => {
                        DOM.speechStatus.textContent = `Error: ${event.error}`;
                        State.isListening = false;
                        DOM.listenBtnText.textContent = 'Start Listening';
                    };
                    this.recognition.onend = () => {
                        if (State.isListening) {
                           this.recognition.start();
                        }
                    };
                }
            },
            speak(text, lang, onEndCallback) {
                if (!this.synth || !text) { if (onEndCallback) onEndCallback(); return; }
                if (this.synth.speaking) this.synth.cancel();
                
                const utterThis = new SpeechSynthesisUtterance(text);
                utterThis.lang = lang;
                utterThis.onend = () => { if (onEndCallback) onEndCallback(); };
                utterThis.onerror = (e) => { console.error('Speech synthesis error:', e); if (onEndCallback) onEndCallback(); };
                setTimeout(() => this.synth.speak(utterThis), 50);
            },
            toggleListening() {
                if (!this.recognition) return;
                if (State.isListening) {
                    this.recognition.stop();
                    State.isListening = false;
                    DOM.listenBtnText.textContent = 'Start Listening';
                    DOM.speechStatus.textContent = 'Speech recognition stopped.';
                } else {
                    this.recognition.lang = State.currentCard.currentToLang;
                    this.recognition.start();
                    State.isListening = true;
                    DOM.listenBtnText.textContent = 'Stop Listening';
                    DOM.speechStatus.textContent = 'Listening...';
                }
            }
        };

        const Data = {
            defaultScore: () => ({ correct: 0, incorrect: 0, lastTrained: null }),
            loadSettings() {
                const savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');

                // Migration check: If the saved version is not the current app version,
                // we can enforce new defaults for specific settings.
                const needsDefaultUpdate = savedSettings.version !== APP_VERSION;

                State.settings = {
                    version: APP_VERSION, // Always stamp the current version
                    nickname: savedSettings.nickname || 'BetaKlug',
                    theme: savedSettings.theme || 'purple',
                    nativeLangCode: needsDefaultUpdate ? 'de-DE' : (savedSettings.nativeLangCode || 'de-DE'),
                    foreignLangCode: needsDefaultUpdate ? 'en-US' : (savedSettings.foreignLangCode || 'en-US'),
                    autoAdvanceCorrect: needsDefaultUpdate ? 60 : (savedSettings.autoAdvanceCorrect ?? 60),
                    autoAdvanceWrong: needsDefaultUpdate ? 60 : (savedSettings.autoAdvanceWrong ?? 60),
                    maxQuestions: savedSettings.maxQuestions || 20, // Keep user's preference if it exists
                    repeatAfter: savedSettings.repeatAfter || 5, // Keep user's preference if it exists
                    binThresholds: savedSettings.binThresholds || { p1: 25, p2: 50, p3: 75 } // Keep user's preference
                };
                this.saveSettings(); // Save immediately to ensure migration only runs once.
            },
            loadData() {
                const localCards = JSON.parse(localStorage.getItem('flashcards') || '[]');
                if (localCards.length > 0 && localCards[0].english) { // Old format detected
                    State.flashcards = localCards.map(card => ({
                        id: card.id,
                        lecture: card.lecture,
                        translations: { 'en-US': card.english, 'de-DE': card.german },
                        scores: card.scores || {}
                    }));
                    this.saveFlashcards();
                    UI.showToast('Old data format migrated!');
                } else {
                    State.flashcards = localCards;
                }

                if (typeof defaultLecturesData !== 'undefined') {
                    this.enrichData(defaultLecturesData);
                }

                State.quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
            },
            enrichData(defaultData) {
                let updated = false;
                defaultData.forEach(defaultCard => {
                    const nativeLang = 'en-US';
                    const nativePhrase = defaultCard.translations[nativeLang];
                    const existingCard = State.flashcards.find(c => c.lecture === defaultCard.lecture && c.translations[nativeLang] === nativePhrase);

                    if (existingCard) {
                        Object.keys(defaultCard.translations).forEach(langCode => {
                            if (!existingCard.translations[langCode]) {
                                existingCard.translations[langCode] = defaultCard.translations[langCode];
                                updated = true;
                            }
                        });
                    } else {
                        const newId = State.flashcards.length > 0 ? Math.max(...State.flashcards.map(c => c.id)) + 1 : 1;
                        State.flashcards.push({
                            id: newId,
                            lecture: defaultCard.lecture,
                            translations: defaultCard.translations,
                            scores: {}
                        });
                        updated = true;
                    }
                });
                if (updated) this.saveFlashcards();
            },
            saveFlashcards() { localStorage.setItem('flashcards', JSON.stringify(State.flashcards)); },
            saveQuizHistory(newEntry) {
                State.quizHistory.unshift(newEntry);
                if (State.quizHistory.length > 50) State.quizHistory.pop();
                localStorage.setItem('quizHistory', JSON.stringify(State.quizHistory));
            },
            saveSettings() { localStorage.setItem('settings', JSON.stringify(State.settings)); },
            exportData() {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                    flashcards: State.flashcards,
                    quizHistory: State.quizHistory,
                    settings: State.settings
                }, null, 2));
                const dl = document.createElement('a');
                dl.setAttribute("href", dataStr);
                dl.setAttribute("download", "vocab_quiz_export.json");
                dl.click();
            },
            importData(file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if(data.flashcards && data.settings) {
                            State.flashcards = data.flashcards;
                            State.quizHistory = data.quizHistory || [];
                            State.settings = data.settings;
                            this.saveFlashcards();
                            this.saveQuizHistory({ date: new Date().toISOString() }); // Dummy entry to satisfy save logic
                            State.quizHistory.shift(); // Remove dummy
                            this.saveSettings();
                            location.reload();
                        } else {
                            UI.showToast("Invalid data file structure.", true);
                        }
                    } catch(e) { UI.showToast("Failed to read file.", true); }
                };
                reader.readAsText(file);
            }
        };

        const init = () => {
            Data.loadSettings();
            Data.loadData();
            Speech.init();
            
            document.title = `Flashcard Language Quiz - v${APP_VERSION}`;
            DOM.footerVersion.textContent = `Vocabulary Quiz - v${APP_VERSION}`;

            UI.populateLanguageSelectors();
            UI.applySettings();
            UI.updateCardList();
            
            DOM.navToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); DOM.navMenu.classList.toggle('hidden'); });
            document.addEventListener('click', () => DOM.navMenu.classList.add('hidden'));
            DOM.navLinks.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); UI.showPage(e.target.dataset.page); }));
            
            DOM.headerQuizBtn.addEventListener('click', () => { UI.updateQuizLectureFilter(); UI.showModal(DOM.quizSetupView); });
            DOM.goToQuizSetupBtn.addEventListener('click', () => { UI.updateQuizLectureFilter(); UI.showModal(DOM.quizSetupView); });
            
            DOM.backToMainBtn.addEventListener('click', () => UI.hideModal(DOM.quizSetupView));
            DOM.backToHubBtn.addEventListener('click', () => { UI.hideModal(DOM.quizFeedbackView); UI.showPage('main-page'); });
            
            DOM.saveSettingsBtn.addEventListener('click', () => {
                const newNative = DOM.nativeLangSelect.value;
                const newForeign = DOM.foreignLangSelect.value;
                if (newNative === newForeign) {
                    UI.showToast("Native and Foreign languages cannot be the same.", true);
                    return;
                }
                State.settings.nativeLangCode = newNative;
                State.settings.foreignLangCode = newForeign;
                State.settings.nickname = DOM.nicknameInput.value.trim() || 'BetaKlug';
                State.settings.theme = DOM.themeSelect.value;
                State.settings.autoAdvanceCorrect = parseInt(DOM.autoAdvanceCorrectTime.value, 10);
                State.settings.autoAdvanceWrong = parseInt(DOM.autoAdvanceWrongTime.value, 10);
                State.settings.maxQuestions = parseInt(DOM.maxQuizQuestions.value, 10);
                State.settings.repeatAfter = parseInt(DOM.repeatAfterInput.value, 10);
                State.settings.binThresholds.p1 = parseInt(DOM.bin1Slider.value, 10);
                State.settings.binThresholds.p2 = parseInt(DOM.bin2Slider.value, 10);
                State.settings.binThresholds.p3 = parseInt(DOM.bin3Slider.value, 10);
                Data.saveSettings();
                UI.applySettings();
                UI.updateCardList();
                UI.showToast('Settings saved!');
            });
            
            DOM.addCardForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nativePhrase = DOM.nativeWordInput.value.trim().toLowerCase();
                const foreignPhrase = DOM.foreignWordInput.value.trim().toLowerCase();
                const lecture = DOM.lectureInput.value.trim() || 'General';
                const { nativeLangCode, foreignLangCode } = State.settings;

                if (!nativePhrase || !foreignPhrase) return;

                const existingCard = State.flashcards.find(c => 
                    c.translations[nativeLangCode] === nativePhrase || 
                    c.translations[foreignLangCode] === foreignPhrase);

                if (existingCard) {
                    existingCard.translations[nativeLangCode] = nativePhrase;
                    existingCard.translations[foreignLangCode] = foreignPhrase;
                    UI.showToast('Updated existing phrase.');
                } else {
                    const newId = State.flashcards.length > 0 ? Math.max(...State.flashcards.map(c => c.id)) + 1 : 1;
                    State.flashcards.push({
                        id: newId, lecture,
                        translations: { [nativeLangCode]: nativePhrase, [foreignLangCode]: foreignPhrase },
                        scores: {}
                    });
                    UI.showToast('New phrase added!');
                }
                Data.saveFlashcards();
                UI.updateCardList();
                DOM.addCardForm.reset();
                DOM.lectureInput.value = lecture;
            });
            
            DOM.startQuizBtn.addEventListener('click', () => {
                const lecture = DOM.quizLectureFilter.value;
                const direction = document.querySelector('input[name="quiz-direction"]:checked').value;
                const mode = document.querySelector('input[name="quiz-mode"]:checked').value;
                Quiz.initiate(lecture, direction, mode);
            });

            DOM.endQuizBtn.addEventListener('click', () => {
                clearTimeout(State.autoAdvanceTimer);
                UI.hideModal(DOM.quizSection);
                Quiz.showFeedback();
            });

            DOM.cardListEl.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.delete-btn');
                if (deleteBtn) {
                    const cardId = Number(deleteBtn.dataset.id);
                    State.flashcards = State.flashcards.filter(card => card.id !== cardId);
                    Data.saveFlashcards();
                    UI.updateCardList();
                    return;
                }
                const speakBtn = e.target.closest('.speak-list-btn');
                if (speakBtn) {
                    Speech.speak(speakBtn.dataset.speakText, speakBtn.dataset.speakLang);
                }
            });
            
            DOM.quizSuggestionsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.direct-start-btn');
                if (btn) {
                    Quiz.initiate(btn.dataset.lecture, 'mixed', 'choice');
                }
            });

            DOM.choiceInputContainer.addEventListener('click', e => { if(e.target.classList.contains('choice-btn')) Quiz.checkAnswer(e.target.textContent); });
            DOM.checkAnswerBtn.addEventListener('click', () => Quiz.checkAnswer(DOM.answerInput.value));
            DOM.answerInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') DOM.checkAnswerBtn.click(); });
            DOM.nextQuestionBtn.addEventListener('click', () => Quiz.loadNextQuestion());
            DOM.speakBtn.addEventListener('click', (e) => Speech.speak(e.currentTarget.dataset.speakText, e.currentTarget.dataset.speakLang));
            DOM.speakQuestionBtn.addEventListener('click', () => Speech.speak(State.currentCard.question, State.currentCard.currentFromLang));
            DOM.listenBtn.addEventListener('click', () => Speech.toggleListening());
            [DOM.bin1Slider, DOM.bin2Slider, DOM.bin3Slider].forEach(slider => slider.addEventListener('input', () => UI.updateBinSliderLabelsAndConstraints()));
            DOM.exportBtn.addEventListener('click', () => Data.exportData());
            DOM.importBtn.addEventListener('click', () => DOM.importFileInput.click());
            DOM.importFileInput.addEventListener('change', (e) => Data.importData(e.target.files[0]));

            UI.showPage('main-page');
        };

        return { init };
    })();

    app.init();
});
