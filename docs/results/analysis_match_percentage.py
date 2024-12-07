import pandas as pd
import matplotlib.pyplot as plt

manual_analyses = pd.read_csv('manual_analyses.csv')
manual_analyses['Correto'] = manual_analyses['Correto'].astype(str)
total_entries = len(manual_analyses)
correct_entries = manual_analyses['Correto'].str.upper().eq('TRUE').sum()
incorrect_entries = total_entries - correct_entries

accuracy_rate = correct_entries / total_entries
error_rate = incorrect_entries / total_entries

print(f"Total de Entradas: {total_entries}")
print(f"Taxa de Acerto: {accuracy_rate:.2%}")
print(f"Taxa de Erro: {error_rate:.2%}")

labels = ['Acertos', 'Erros']
sizes = [accuracy_rate * 100, error_rate * 100]
colors = ['#4CAF50', '#F44336']
explode = (0.1, 0)

plt.figure(figsize=(10, 8))
plt.rcParams['font.family'] = 'JetBrains Mono'

plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90, colors=colors, explode=explode, textprops={'fontsize': 14, 'fontweight': 'bold', 'color': 'white'})

plt.axis('equal')
plt.legend(labels, title="Legenda", loc="best")

plt.savefig('taxa-acertos-erros-analise.png', dpi=300, bbox_inches='tight')
