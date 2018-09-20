# Слово-chooser

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6b9ce4a748ed47e58a45cb085d369f50)](https://app.codacy.com/app/beinghavingbreackfast/slovo-chooser?utm_source=github.com&utm_medium=referral&utm_content=code-hunger/slovo-chooser&utm_campaign=Badge_Grade_Settings)

## What is this?

A tool that helps *foreign language learners* pick unknown words from any song/article/other text they like, and quickly generate long lists of these words along with translations and the context they're used within.

The generated list can be downloaded as a *.csv* file which can be imported in Anki, spreadsheet programs like Excell, or anything else that supports csv.

## What does it do?

* Splits the text you give it (called a *text source*) into smaller chunks so that you're not overwhelmed. 
* On each turn gives you the next chunk, words are in the form of clickable buttons. 
* You select any unknown words.
* For each unknown word:
    * Gives you a dictionary (chosen by you) open right at the chosen word
    * Asks you for the translation apropriate for the context
    * Chooses the whole text chunk as the context for the word. You have the option to choose a smaller part from it.
* Shows you the next chunk when you're ready with this one.
* Gives you a *Download* button - you can click it any time you want. Best when you've gone through all chunks of the current text.

#### Additional features:

* Every word you save goes to the browser's local storage so that your work is not lost when you close the browser. 
  * This means, you can start now, save some words and come back tomorrow.

* You can have as many different texts at a single moment as you want.
  * This allows you, for example, to add songs' lyrics to слово-chooser as you listen, and process all of them at once when you feel like doing so.
  * For your convenience, you can give a name for each text source so that you know where the words you're translating come from.

## How to use it?

A build of the code is available here: http://code-hunger.github.io/slovo-chooser

Initially you'll be prompted to enter a text source. Paste the lyrics of a foreign language song you like, set a name, and enjoy it!

## Build steps

`npm i; npm run`. Nothing more, nothing less.
