#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Blockchain Enhanced Voter Authentication System
Sentiment Analysis Model for Real-Time Analytics Dashboard

This module contains a sentiment analysis model that processes voter comments
and feedback to determine sentiment (positive, negative, neutral). The model uses
a combination of lexicon-based approach and a simple machine learning classifier.
"""

import re
import numpy as np
import pandas as pd
from collections import Counter
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib
import json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import Flask-CORS

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

class BlockchainVotingSentimentAnalyzer:
    """
    A sentiment analysis model for the blockchain voting system.
    It analyzes text feedback from voters to determine sentiment polarity.
    """
    
    # The rest of the class remains unchanged...
    # [Keeping the existing implementation]
    def __init__(self, load_pretrained=True, model_path='voting_sentiment_model.pkl'):
        """
        Initialize the sentiment analyzer, either by loading a pre-trained model
        or preparing for training a new one.
        
        Args:
            load_pretrained (bool): Whether to load a pre-trained model
            model_path (str): Path to the pre-trained model file
        """
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Sentiment lexicons (expanded for better coverage)
        self.positive_words = {
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'easy', 'efficient', 'secure', 'transparent', 'fair', 'accessible',
            'innovative', 'helpful', 'convenient', 'trustworthy', 'reliable',
            'effective', 'satisfied', 'impressed', 'smooth', 'seamless',
            'accurate', 'intuitive', 'responsive', 'fast', 'quick',
            'privacy', 'private', 'protected', 'simple', 'clear',
            'legitimate', 'verifiable', 'authentic', 'like', 'love', 
            'approve', 'support', 'recommend', 'confident', 'confidence',
            'easy', 'simple', 'perfect', 'valuable', 'valuable', 'beneficial',
            'advantage', 'success', 'successful', 'improvement', 'improved',
            'enhance', 'enhanced', 'superior', 'best', 'better', 'positive',
            'gain', 'gained', 'progress', 'progressed', 'achieve', 'achieved'
        }
        
        self.negative_words = {
            'bad', 'poor', 'terrible', 'awful', 'disappointing', 'difficult',
            'complex', 'complicated', 'confusing', 'slow', 'insecure', 'unfair',
            'biased', 'suspicious', 'unreliable', 'buggy', 'glitchy', 'error',
            'problem', 'issue', 'concern', 'worried', 'frustrated', 'annoyed',
            'angry', 'disappointed', 'failed', 'failure', 'crash', 'broken',
            'vulnerable', 'risky', 'unsafe', 'hack', 'fraud', 'manipulation',
            'dislike', 'hate', 'against', 'reject', 'oppose', 'fear',
            'difficult', 'hard', 'inefficient', 'inconvenient', 'incompetent',
            'waste', 'wasted', 'obstacle', 'obstruct', 'obstructed', 'hindrance',
            'flawed', 'bug', 'glitch', 'malfunction', 'fault', 'flaw',
            'wrong', 'worse', 'worst', 'negative', 'loss', 'lost'
        }
        
        # Emoji sentiment mapping with stronger weights
        self.emoji_sentiment = {
            '😊': 2, '👍': 2, '🙂': 1, '😀': 2, '😃': 2, '😄': 2, '😁': 2, '🥰': 3,
            '❤️': 3, '👏': 2, '✅': 1, '✔️': 1, '💯': 2, '🔒': 1, '🛡️': 1, '🌟': 2,
            '😞': -2, '👎': -2, '😟': -1, '😠': -2, '😡': -3, '😢': -2, '😭': -3,
            '❌': -1, '⛔': -1, '🚫': -1, '⚠️': -1, '🔓': -1, '💔': -2, '😕': -1
        }
        
        # Expanded training data with more balanced samples
        self.sample_data = {
            "texts": [
                "This voting system is incredibly secure and easy to use!",
                "I found the blockchain authentication process very straightforward.",
                "The multi-factor authentication makes me feel my vote is secure.",
                "I love how I can see my vote was recorded correctly on the blockchain.",
                "The voting interface is intuitive and accessible for everyone.",
                "The real-time results feature is amazing!",
                "I appreciate the transparency of this blockchain voting system.",
                "Quick and efficient voting process, much better than traditional methods.",
                "The ranked-choice voting option gives me more voice in the election.",
                "Received my NFT voting badge - cool incentive to participate!",
                "Love the transparency of seeing my vote on the blockchain! 👍",
                "The verification process was seamless and made me confident!",
                "Excellent security features, I trust that my vote is authentic.",
                "The blockchain implementation really improved my confidence in voting.",
                "So simple to use even for non-technical people like me.",
                "The digital receipt for my vote is fantastic - finally proof!",
                "Perfect combination of security and user-friendliness.",
                "Best voting experience I've ever had - fast and secure!",
                "The mobile interface is so intuitive and well-designed.",
                "I'm impressed by how quickly my vote was validated on the blockchain.",
                
                "I had trouble with the biometric authentication.",
                "The system is too complicated for non-technical voters.",
                "My vote took too long to be confirmed on the blockchain.",
                "I'm concerned about privacy with the biometric requirements.",
                "Had an error during the voting process and had to start over.",
                "The dispute resolution process seems unclear and potentially biased.",
                "Too many steps to authenticate my identity.",
                "The system crashed when I tried to submit my vote.",
                "Not sure if my vote was actually counted.",
                "The geo-fencing restriction is frustrating for travelers.",
                "This is way too complicated for the average voter.",
                "The app keeps crashing when I try to verify my identity.",
                "I don't trust the security of this blockchain system.",
                "Couldn't vote because of technical issues with authentication.",
                "The interface is confusing and poorly designed.",
                "Had to wait over an hour for my vote to be confirmed.",
                "The help documentation is insufficient and unclear.",
                "My personal data doesn't seem secure in this system.",
                "The verification steps are excessive and frustrating.",
                "Experienced multiple errors and finally gave up trying to vote.",
                
                "Overall satisfied with the voting experience.",
                "Instructions could be clearer but it worked fine.",
                "Neither impressed nor disappointed with the system.",
                "Just another voting system, nothing special.",
                "It's okay, gets the job done I suppose.",
                "Not sure if this is better than traditional methods.",
                "Average experience, some good features, some issues.",
                "The interface is functional but not remarkable.",
                "It's a voting system, it works as expected.",
                "The system worked as expected, nothing special but no major issues either.",
                "Some aspects are good, others need improvement.",
                "It's a decent implementation but there's room for growth.",
                "Middle-of-the-road experience - not great, not terrible.",
                "Has potential but needs refinement in several areas.",
                "The concept is good but execution is just adequate.",
                "It functions correctly but the design could be improved.",
                "An acceptable solution though not particularly innovative.",
                "Meets minimum requirements but doesn't exceed expectations.",
                "Some features are well-implemented, others feel unfinished.",
                "I can use it, but wouldn't rave about it to others."
            ],
            "labels": [
                "positive", "positive", "positive", "positive", "positive",
                "positive", "positive", "positive", "positive", "positive",
                "positive", "positive", "positive", "positive", "positive",
                "positive", "positive", "positive", "positive", "positive",
                
                "negative", "negative", "negative", "negative", "negative",
                "negative", "negative", "negative", "negative", "negative",
                "negative", "negative", "negative", "negative", "negative",
                "negative", "negative", "negative", "negative", "negative",
                
                "neutral", "neutral", "neutral", "neutral", "neutral",
                "neutral", "neutral", "neutral", "neutral", "neutral",
                "neutral", "neutral", "neutral", "neutral", "neutral",
                "neutral", "neutral", "neutral", "neutral", "neutral"
            ]
        }
        
        # Improved model pipeline with better feature engineering and classifier
        self.pipeline = Pipeline([
            ('vectorizer', TfidfVectorizer(
                max_features=10000,  # Increased from 5000
                min_df=2,  # Reduced from 5 to capture more rare but important terms
                max_df=0.85,  # Increased from 0.7 to include more common terms
                ngram_range=(1, 3),  # Include up to trigrams for better context
                use_idf=True,
                sublinear_tf=True  # Apply sublinear tf scaling
            )),
            ('classifier', RandomForestClassifier(  # Changed from LogisticRegression
                n_estimators=100,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight='balanced',
                random_state=42
            ))
        ])
        
        if load_pretrained:
            try:
                self.pipeline = joblib.load(model_path)
                print(f"Loaded pre-trained model from {model_path}")
            except FileNotFoundError:
                print(f"No pre-trained model found at {model_path}. Will train a new model.")
                self._train_model()
                joblib.dump(self.pipeline, model_path)
        else:
            self._train_model()
            joblib.dump(self.pipeline, model_path)
    
    def _preprocess_text(self, text):
        """
        Preprocess text by converting to lowercase, removing special characters,
        lemmatizing, and removing stop words.
        
        Args:
            text (str): Input text to preprocess
            
        Returns:
            str: Preprocessed text
        """
        # Extract emoji sentiment first
        emoji_score = 0
        for emoji, score in self.emoji_sentiment.items():
            if emoji in text:
                emoji_score += score
                text = text.replace(emoji, ' ')
        
        # Keep certain punctuation that might indicate sentiment
        text = text.replace('!', ' exclamation ')
        text = text.replace('?', ' question ')
        
        # Convert to lowercase and remove special characters
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        
        # Tokenize, remove stop words, and lemmatize
        tokens = word_tokenize(text)
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens if token not in self.stop_words]
        
        return ' '.join(tokens), emoji_score
    
    def _lexicon_based_score(self, preprocessed_text):
        """
        Calculate sentiment score using lexicon approach.
        
        Args:
            preprocessed_text (str): Preprocessed text input
            
        Returns:
            float: Sentiment score between -1 and 1
        """
        tokens = preprocessed_text.split()
        positive_count = sum(1 for token in tokens if token in self.positive_words)
        negative_count = sum(1 for token in tokens if token in self.negative_words)
        
        total_sentiment_words = positive_count + negative_count
        if total_sentiment_words == 0:
            return 0
        
        # Calculate normalized score between -1 and 1
        return (positive_count - negative_count) / max(1, total_sentiment_words)
    
    def _train_model(self):
        """Train the sentiment analysis model using the built-in sample data."""
        # Preprocess texts
        processed_texts = []
        for text in self.sample_data["texts"]:
            processed_text, _ = self._preprocess_text(text)
            processed_texts.append(processed_text)
        
        # Convert labels to numerical values
        label_map = {"positive": 2, "neutral": 1, "negative": 0}
        y = np.array([label_map[label] for label in self.sample_data["labels"]])
        
        # Cross-validation for more reliable evaluation
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(self.pipeline, processed_texts, y, cv=cv, scoring='f1_weighted')
        print(f"Cross-validation F1 scores: {cv_scores}")
        print(f"Mean F1 score: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
        
        # Train model on the entire dataset
        self.pipeline.fit(processed_texts, y)
        
        # Evaluate on the training set to check for overfitting
        y_pred = self.pipeline.predict(processed_texts)
        print("\nTraining set evaluation:")
        print(classification_report(y, y_pred, target_names=["negative", "neutral", "positive"]))
        
        # Split data for a separate test evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            processed_texts, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train on training subset
        pipeline_test = Pipeline([
            ('vectorizer', TfidfVectorizer(
                max_features=10000,
                min_df=2,
                max_df=0.85,
                ngram_range=(1, 3),
                use_idf=True,
                sublinear_tf=True
            )),
            ('classifier', RandomForestClassifier(
                n_estimators=100,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight='balanced',
                random_state=42
            ))
        ])
        
        pipeline_test.fit(X_train, y_train)
        
        # Evaluate on test subset
        y_pred = pipeline_test.predict(X_test)
        print("\nTest set evaluation:")
        print(classification_report(y_test, y_pred, target_names=["negative", "neutral", "positive"]))
    
    def analyze_sentiment(self, text):
        """
        Analyze the sentiment of the input text.
        
        Args:
            text (str): Input text to analyze
            
        Returns:
            dict: Dictionary containing sentiment analysis results
        """
        # Preprocess text
        preprocessed_text, emoji_score = self._preprocess_text(text)
        
        # Get lexicon-based score
        lexicon_score = self._lexicon_based_score(preprocessed_text)
        
        # Get ML model prediction
        ml_prediction = self.pipeline.predict([preprocessed_text])[0]
        ml_probabilities = self.pipeline.predict_proba([preprocessed_text])[0]
        
        # Map numerical predictions to labels
        sentiment_labels = ["negative", "neutral", "positive"]
        ml_sentiment = sentiment_labels[ml_prediction]
        
        # Combine models with adjusted weights (ML model: 0.5, lexicon: 0.3, emoji: 0.2)
        # Convert lexicon score from [-1,1] to [0,2] for compatibility
        lexicon_adjusted = (lexicon_score + 1)  # Now [0,2]
        
        # Normalize emoji score
        emoji_adjusted = 1.0  # Default neutral
        if emoji_score > 0:
            emoji_adjusted = min(2.0, 1.0 + emoji_score / 3.0)  # Scale positive
        elif emoji_score < 0:
            emoji_adjusted = max(0.0, 1.0 + emoji_score / 3.0)  # Scale negative
        
        # Assign weights based on presence of each signal
        ml_weight = 0.5
        lexicon_weight = 0.3 if lexicon_score != 0 else 0.1
        emoji_weight = 0.2 if emoji_score != 0 else 0.0
        
        # Normalize weights to sum to 1.0
        total_weight = ml_weight + lexicon_weight + emoji_weight
        ml_weight = ml_weight / total_weight
        lexicon_weight = lexicon_weight / total_weight
        emoji_weight = emoji_weight / total_weight
        
        # Calculate ensemble score
        ensemble_score = (
            ml_weight * ml_prediction +
            lexicon_weight * lexicon_adjusted +
            emoji_weight * emoji_adjusted
        )
        
        # Map ensemble score to sentiment label with adjusted thresholds
        if ensemble_score < 0.8:  # More stringent threshold for negative
            ensemble_sentiment = "negative"
        elif ensemble_score > 1.2:  # More lenient threshold for positive
            ensemble_sentiment = "positive"
        else:
            ensemble_sentiment = "neutral"
        
        # Calculate confidence
        # Highest probability from ML model combined with agreement certainty
        ml_confidence = max(ml_probabilities)
        
        # Agreement factor: how much the different methods agree
        methods = []
        if ml_prediction == 0: methods.append("negative")
        elif ml_prediction == 1: methods.append("neutral")
        else: methods.append("positive")
        
        if lexicon_score < -0.2: methods.append("negative")
        elif lexicon_score > 0.2: methods.append("positive")
        else: methods.append("neutral")
        
        if emoji_score < -1: methods.append("negative")
        elif emoji_score > 1: methods.append("positive")
        elif emoji_score != 0: methods.append("neutral")
        
        agreement = len(set(methods))  # 1 means complete agreement, 3 means complete disagreement
        agreement_factor = 1.0 - ((agreement - 1) / 2.0)  # Scale to 0.0-1.0
        
        # Combine ML confidence with agreement factor
        confidence = (ml_confidence * 0.7) + (agreement_factor * 0.3)
        
        # Extract key terms that influenced the sentiment
        words = preprocessed_text.split()
        positive_terms = [word for word in words if word in self.positive_words]
        negative_terms = [word for word in words if word in self.negative_words]
        
        # Add debug info to help understand the classification
        debug_info = {
            "ml_prediction": sentiment_labels[ml_prediction],
            "ml_probabilities": {
                "positive": round(ml_probabilities[2], 2),
                "neutral": round(ml_probabilities[1], 2),
                "negative": round(ml_probabilities[0], 2)
            },
            "lexicon_score": round(lexicon_score, 2),
            "emoji_score": emoji_score,
            "ensemble_components": {
                "ml_contribution": round(ml_weight * ml_prediction, 2),
                "lexicon_contribution": round(lexicon_weight * lexicon_adjusted, 2),
                "emoji_contribution": round(emoji_weight * emoji_adjusted, 2)
            },
            "ensemble_score": round(ensemble_score, 2),
            "agreement_factor": round(agreement_factor, 2)
        }
        
        return {
            "original_text": text,
            "sentiment": ensemble_sentiment,
            "confidence": round(confidence, 2),
            "sentiment_scores": {
                "positive": round(ml_probabilities[2], 2),
                "neutral": round(ml_probabilities[1], 2),
                "negative": round(ml_probabilities[0], 2)
            },
            "key_terms": {
                "positive": positive_terms[:5],
                "negative": negative_terms[:5]
            },
            "debug": debug_info
        }

    def batch_analyze(self, texts):
        """
        Analyze sentiment for a batch of texts.
        
        Args:
            texts (list): List of text inputs to analyze
            
        Returns:
            list: List of sentiment analysis results
        """
        return [self.analyze_sentiment(text) for text in texts]

    def get_sentiment_statistics(self, analysis_results):
        """
        Generate sentiment statistics from a list of analysis results.
        
        Args:
            analysis_results (list): List of sentiment analysis results
            
        Returns:
            dict: Statistics about the sentiment distribution
        """
        sentiments = [result["sentiment"] for result in analysis_results]
        sentiment_counts = Counter(sentiments)
        total = len(sentiments)
        
        statistics = {
            "total_analyzed": total,
            "sentiment_distribution": {
                "positive": {
                    "count": sentiment_counts.get("positive", 0),
                    "percentage": round(sentiment_counts.get("positive", 0) / total * 100 if total else 0, 1)
                },
                "neutral": {
                    "count": sentiment_counts.get("neutral", 0),
                    "percentage": round(sentiment_counts.get("neutral", 0) / total * 100 if total else 0, 1)
                },
                "negative": {
                    "count": sentiment_counts.get("negative", 0),
                    "percentage": round(sentiment_counts.get("negative", 0) / total * 100 if total else 0, 1)
                }
            }
        }
        
        # Add overall sentiment score (weighted average)
        sentiment_values = {"positive": 1, "neutral": 0, "negative": -1}
        weighted_sum = sum(sentiment_values[s] for s in sentiments)
        statistics["overall_sentiment_score"] = round(weighted_sum / total if total else 0, 2)
        
        # Calculate average confidence score
        avg_confidence = sum(result["confidence"] for result in analysis_results) / total if total else 0
        statistics["average_confidence"] = round(avg_confidence, 2)
        
        # Add most common positive and negative terms
        positive_terms = []
        negative_terms = []
        for result in analysis_results:
            positive_terms.extend(result["key_terms"]["positive"])
            negative_terms.extend(result["key_terms"]["negative"])
        
        statistics["most_common_terms"] = {
            "positive": [term for term, _ in Counter(positive_terms).most_common(10)],
            "negative": [term for term, _ in Counter(negative_terms).most_common(10)]
        }
        
        return statistics

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create sentiment analyzer instance
analyzer = None

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    """
    Flask endpoint to analyze the sentiment of input text.
    
    Expects a JSON payload with a 'text' field.
    """
    global analyzer
    
    # Initialize analyzer if not already done
    if analyzer is None:
        analyzer = BlockchainVotingSentimentAnalyzer(load_pretrained=False)
    
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text input. Please provide a JSON payload with a "text" field.'}), 400
    
    text = data['text']
    if not text or not isinstance(text, str):
        return jsonify({'error': 'Invalid text input. Please provide a non-empty string.'}), 400
    
    result = analyzer.analyze_sentiment(text)
    return jsonify(result)

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze_sentiment():
    """
    Flask endpoint to analyze sentiment for multiple texts.
    
    Expects a JSON payload with a 'texts' field containing an array of strings.
    """
    global analyzer
    
    # Initialize analyzer if not already done
    if analyzer is None:
        analyzer = BlockchainVotingSentimentAnalyzer(load_pretrained=False)
    
    data = request.json
    
    if not data or 'texts' not in data:
        return jsonify({'error': 'Missing texts input. Please provide a JSON payload with a "texts" field.'}), 400
    
    texts = data['texts']
    if not isinstance(texts, list) or not all(isinstance(text, str) for text in texts):
        return jsonify({'error': 'Invalid texts input. Please provide an array of strings.'}), 400
    
    results = analyzer.batch_analyze(texts)
    stats = analyzer.get_sentiment_statistics(results)
    
    return jsonify({
        'results': results,
        'statistics': stats
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'Blockchain Voting Sentiment Analyzer API'})

def main():
    """
    Main function to demonstrate the sentiment analyzer functionality.
    """
    # Example usage
    analyzer = BlockchainVotingSentimentAnalyzer(load_pretrained=False)
    
    # Example inputs
    example_inputs = [
        "The blockchain verification process was seamless and I felt confident my vote was secure.",
        "Had technical issues with the biometric authentication and couldn't vote properly.",
        "The system worked as expected, nothing special but no major issues either.",
        "Love the transparency of seeing my vote on the blockchain! 👍",
        "This is way too complicated for the average voter. It needs to be simplified."
    ]
    
    print("\nAnalyzing example inputs:")
    for text in example_inputs:
        result = analyzer.analyze_sentiment(text)
        print(f"\nInput: {text}")
        print(f"Sentiment: {result['sentiment']} (Confidence: {result['confidence']})")
        print(f"Scores: {result['sentiment_scores']}")
        print(f"Key positive terms: {', '.join(result['key_terms']['positive'])}")
        print(f"Key negative terms: {', '.join(result['key_terms']['negative'])}")
        print(f"Debug: {json.dumps(result['debug'], indent=2)}")
    
    # Batch analysis and statistics
    batch_results = analyzer.batch_analyze(example_inputs)
    stats = analyzer.get_sentiment_statistics(batch_results)
    
    print("\nSentiment Statistics:")
    print(json.dumps(stats, indent=2))

if __name__ == "__main__":
    # Always run as API server
    print("Starting Blockchain Voting Sentiment Analyzer API server...")
    app.run(host='0.0.0.0', port=5000, debug=True)