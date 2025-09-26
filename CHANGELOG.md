# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - 2025-09-26

This version represents a major architectural overhaul, refactoring the application from a two-language system into a flexible, multi-language platform.

### Added

*   **Multi-Language Support:**

    *   The core data structure has been rebuilt to support multiple languages per phrase.
    *   A default dictionary was added with translations for English, German, French, Spanish, and Italian.
    *   "Native Language" and "Foreign Language" selectors were added in the settings to allow users to fully customize their learning pair.

*   **Project Structure:**

    *   Created a `dictionary.js` file to store and manage the default vocabulary, making it easier to expand.

*   **Data Migration:**

    *   Implemented an automatic, one-time data migration script to seamlessly convert existing user data from the old English/German format to the new multi-language structure.
    *   The application now intelligently enriches existing user phrases with new translations if they are added to the dictionary in an update.

### Changed

*   **Architectural Refactor:**

    *   The entire application was refactored from a single HTML file into a modern project structure (`index.html`, `style.css`, `app.js`, `dictionary.js`).
    *   The `app.js` file was modularized to separate concerns (UI, State, Data, Quiz, etc.), improving maintainability and scalability.

*   **UI Improvements:**

    *   All UI labels (e.g., input field titles, quiz direction) now update dynamically based on the languages selected in the settings.
    *   The quiz feedback screen now correctly displays the total possible questions for the session, even if the quiz is ended early.

*   **Default Settings:**

    *   Changed the default native language to German and the default foreign language to English.
    *   Updated the default auto-advance timers to 60 seconds for both correct and incorrect answers.

*   **Audio Logic:**

    *   Restored the original audio playback logic: the foreign language phrase is played automatically when a question is presented (FL -> Native) or when a correct answer is given (Native -> FL).
    *   Restored the audio playback icon next to the question in FL -> Native quizzes and next to all foreign phrases in the main list.

*   **Version Number:** 

    *   Updated the version in the footer to 1.0.3.


## [1.0.2] - Initial Release

This was the initial version of the application, featuring a complete set of tools for learning vocabulary between English and German.

### Features

*   **Core Quiz Functionality:**

    *   Multiple quiz modes: Multiple Choice, Type the Answer, and Speak the Answer (using browser speech recognition).
    *   Selectable quiz direction: English to German, German to English, or Mixed.

*   **Phrase Management:**

    *   Add, delete, and view all phrases.
    *   Group phrases into custom "Lectures".

*   **Advanced Import:**

    *   Add from Image: Use OCR (Tesseract.js) to scan and import phrases from an image.
    *   Add from Text: Paste or upload a `.txt` file to bulk-import phrases.

*   **Data Portability:**

    *   Export and import all application data (phrases, quiz history, settings) in a single JSON file.

*   **Tracking and Statistics:**

    *   **Statistics Page:** View overall performance, including correct/incorrect counts and success rates for each quiz mode and direction.
    *   **Quiz History:** A log of all completed quiz sessions with scores and settings.

*   **Personalization & Settings:**

    *   Set a custom user nickname.
    *   Choose from multiple color themes.
    *   Fine-tune quiz behavior, including auto-advance timers, max questions per quiz, and spaced repetition settings (Bin Thresholds).
    