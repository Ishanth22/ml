from sklearn import exceptions
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE


from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    roc_auc_score, 
    roc_curve, 
    precision_recall_curve
)


import joblib

df=pd.read_csv('data/creditcard.csv')

print(df.head())
print(df.shape)
print(df.value_counts('Class'))


df=df.drop('Time',axis=1)
scaler=StandardScaler()
df["Amount"]=scaler.fit_transform(df[["Amount"]])

X=df.drop("Class",axis=1)
Y=df["Class"]

X_train, X_test, y_train, y_test = train_test_split(
    X, Y, test_size=0.2, random_state=42, stratify=Y
)

print("\n--- Before SMOTE (Training Set) ---")
print(f"X_train shape: {X_train.shape}")
print(y_train.value_counts())



smote = SMOTE(random_state=42)
X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)

print("\n--- After SMOTE (Training Set) ---")
print(f"X_train_smote shape: {X_train_smote.shape}")
print(y_train_smote.value_counts())

print("\n--- Test Set (Unmodified) ---")
print(f"X_test shape: {X_test.shape}")
print(y_test.value_counts())

model=LogisticRegression(max_iter=1000 , random_state=42)
model.fit(X_train_smote,y_train_smote)

y_pred=model.predict(X_test)
print('\n')
print(y_pred)
y_pred_prob_lr=model.predict_proba(X_test)[:,1]
print(y_pred_prob_lr)
print("\nLogistic regression evaluation")
print("\nconfusion matrix:")
con_matrix=confusion_matrix(y_test,y_pred)
print(con_matrix)

print("\n Classification:")
report=classification_report(y_test,y_pred)
print(report)

print("\n ROC-AUC score:")
score=roc_auc_score(y_test,y_pred)
print(score)


print("\n Random forest classifier:")
rf=RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
rf.fit(X_train_smote,y_train_smote)
y_pred_rf=rf.predict(X_test)
y_pred_prob_rf=rf.predict_proba(X_test)[:,1]

print("rf evaluation:")
print("\nconfusion matrix:")
con_matrix_rf=confusion_matrix(y_test,y_pred_rf)
print(con_matrix_rf)

print("\n Classification:")
report_rf=classification_report(y_test,y_pred_rf)
print(report_rf)

print("\n ROC-AUC score:")
score_rf=roc_auc_score(y_test,y_pred_prob_rf)
print(score_rf)

print("\nTop 5 Most Important Features:")
feature_importance = pd.Series(rf.feature_importances_, index=X.columns)
print(feature_importance.sort_values(ascending=False).head(5))


from sklearn.model_selection import GridSearchCV

print("\n=== XGBOOST WITH HYPERPARAMETER TUNING ===")

param_grid = {
    'max_depth': [3, 5, 7],
    'learning_rate': [0.01, 0.1],
    'n_estimators': [100, 200],
    'scale_pos_weight': [1, 5]
}

xgb_grid = GridSearchCV(
    XGBClassifier(eval_metric='logloss', random_state=42),
    param_grid,
    cv=3,
    scoring='f1',
    n_jobs=-1,
    verbose=1
)

xgb_grid.fit(X_train_smote, y_train_smote)
print(f"\nBest Parameters: {xgb_grid.best_params_}")

best_xgb = xgb_grid.best_estimator_
y_pred_xgb = best_xgb.predict(X_test)
y_pred_proba_xgb = best_xgb.predict_proba(X_test)[:, 1]


print("\nconfusion matrix:")
con_matrix_xgb=confusion_matrix(y_test,y_pred_xgb)
print(con_matrix_xgb)

print("\n Classification:")
report_xgb=classification_report(y_test,y_pred_xgb)
print(report_xgb)

print("\n ROC-AUC score:")
score_xgb=roc_auc_score(y_test,y_pred_proba_xgb)
print(score_xgb)

# 
# Task 9: ROC Curve Comparison for All 3 Models


# Compute ROC curve points for each model
fpr_lr, tpr_lr, _ = roc_curve(y_test, y_pred_prob_lr)
fpr_rf, tpr_rf, _ = roc_curve(y_test, y_pred_prob_rf)
fpr_xgb, tpr_xgb, _ = roc_curve(y_test, y_pred_proba_xgb)

# Compute AUC scores using probabilities
auc_lr = roc_auc_score(y_test, y_pred_prob_lr)
auc_rf = roc_auc_score(y_test, y_pred_prob_rf)
auc_xgb = roc_auc_score(y_test, y_pred_proba_xgb)

# Plot all 3 ROC curves on one graph
plt.figure(figsize=(10, 6))
plt.plot(fpr_lr, tpr_lr, label=f'Logistic Regression (AUC = {auc_lr:.4f})', color='blue')
plt.plot(fpr_rf, tpr_rf, label=f'Random Forest (AUC = {auc_rf:.4f})', color='green')
plt.plot(fpr_xgb, tpr_xgb, label=f'XGBoost Tuned (AUC = {auc_xgb:.4f})', color='red')
plt.plot([0, 1], [0, 1], 'k--', label='Random Guess (AUC = 0.5)')

plt.title('ROC Curve Comparison - Fraud Detection Models')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate (Recall)')
plt.legend(loc='lower right')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('roc_curve.png', dpi=150)
print("\nROC curve saved as roc_curve.png")


print("Saving the models")

joblib.dump(rf, 'model.pkl')
joblib.dump(scaler, 'scaler.pkl')
