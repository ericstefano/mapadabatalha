import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

manual_identifications = pd.read_csv('manual_identifications.csv')
model_identifications = pd.read_csv('model_identifications.csv')
manual_identifications['manual_classification'] = manual_identifications['flyer?'].map({'sim': True, 'não': False})
model_identifications['model_classification'] = model_identifications['parsed_content'].map({True: True, False: False, None: False})
merged_data = pd.merge(
 manual_identifications, model_identifications,
left_on='id',
right_on='instagram_post_id'
)
total = len(merged_data)
correct_predictions = len(merged_data[
 (merged_data['manual_classification'] == True) &
 (merged_data['model_classification'] == True)
])
print(correct_predictions)
error_rate = (total - correct_predictions) / total
accuracy_rate = correct_predictions / total
print(total)
print(f"Taxa de Acerto: {accuracy_rate:.2%}")
print(f"Taxa de Erro: {error_rate:.2%}")

labels = ['Acertos', 'Erros']
sizes = [accuracy_rate * 100, error_rate * 100]
colors = ['#4169E1', '#FF7F50']
explode = (0.1, 0)

plt.figure(figsize=(10, 8))
plt.rcParams['font.family'] = 'JetBrains Mono'

plt.pie(
 sizes,
 labels=labels,
 autopct='%1.1f%%',
 startangle=90,
 colors=colors,
 explode=explode,
 textprops={'fontsize': 14, 'fontweight': 'bold', 'color': 'white'}
)

plt.axis('equal')
plt.legend(labels, title="Legenda", loc="best")
plt.savefig('taxa-acertos-erros-identificacao.png', dpi=300, bbox_inches='tight')