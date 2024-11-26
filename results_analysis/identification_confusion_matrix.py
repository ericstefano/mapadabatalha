import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


manual_identifications = pd.read_csv('manual_identifications.csv')
model_identifications = pd.read_csv('model_identifications.csv')

manual_identifications['manual_classification'] = manual_identifications['flyer?'].map({'sim': True, 'não': False})
model_identifications['model_classification'] = model_identifications['parsed_content'].map({ True: True, False: False, None: False})

merged_data = pd.merge(manual_identifications, model_identifications, 
                       left_on='id', 
                       right_on='instagram_post_id')

def calculate_confusion_metrics(true_labels, pred_labels):
    TP = np.sum((true_labels == True) & (pred_labels == True))
    TN = np.sum((true_labels == False) & (pred_labels == False))
    FP = np.sum((true_labels == False) & (pred_labels == True))
    FN = np.sum((true_labels == True) & (pred_labels == False))
    
    return {
        'True Positive': TP,
        'True Negative': TN,
        'False Positive': FP,
        'False Negative': FN
    }


metrics = calculate_confusion_metrics(
    merged_data['manual_classification'], 
    merged_data['model_classification']
)

confusion_matrix = pd.DataFrame({
    'Predito Negativo': [metrics['True Negative'], metrics['False Negative']],
    'Predito Positivo': [metrics['False Positive'], metrics['True Positive']]
}, index=['Real Negativo', 'Real Positivo'])

print("Métricas de Classificação:")
for metric, value in metrics.items():
    print(f"{metric}: {value}")

print("\nMatriz de Confusão:")
print(confusion_matrix)


precision = metrics['True Positive'] / (metrics['True Positive'] + metrics['False Positive'])
recall = metrics['True Positive'] / (metrics['True Positive'] + metrics['False Negative'])
f1_score = 2 * (precision * recall) / (precision + recall)

print(f"\nPrecisão: {precision:.2f}")
print(f"Recall: {recall:.2f}")
print(f"F1-Score: {f1_score:.2f}")

plt.figure(figsize=(12, 8))

ax = sns.heatmap(confusion_matrix, annot=True, fmt='d', cmap='Blues', cbar=False, annot_kws={"size": 14})
plt.title('Matriz de Confusão', fontsize=16)
plt.ylabel('Real', fontsize=14)
plt.xlabel('Predito', fontsize=14)
plt.xticks(rotation=0, fontsize=12)
plt.yticks(rotation=0, fontsize=12)

precision_text = f"Precisão: {precision:.2f}"
recall_text = f"Recall: {recall:.2f}"
f1_score_text = f"F1-Score: {f1_score:.2f}"

plt.figtext(0.15, -0.1, precision_text, fontsize=12, ha="left", wrap=True)
plt.figtext(0.15, -0.15, recall_text, fontsize=12, ha="left", wrap=True)
plt.figtext(0.15, -0.2, f1_score_text, fontsize=12, ha="left", wrap=True)

# Salvando o gráfico como imagem
plt.savefig('matriz_confusao_melhorada.png', dpi=500, bbox_inches='tight')