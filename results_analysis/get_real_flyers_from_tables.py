import pandas as pd
from datetime import datetime

manual_identifications = pd.read_csv('manual_identifications.csv')
model_identifications = pd.read_csv('model_identifications.csv')
post_analyses = pd.read_csv('post_analyses.csv')

def convert_to_iso(date_str):
    if pd.isna(date_str):
        return None
    try:
        dt = datetime.strptime(date_str, '%d/%m/%Y %H:%M:%S')
        return dt.strftime('%Y-%m-%dT%H:%M')
    except:
        try:
            dt = datetime.strptime(date_str, '%d/%m/%Y %H:%M')
            return dt.strftime('%Y-%m-%dT%H:%M')
        except:
            return None

manual_identifications['manual_classification'] = manual_identifications['flyer?'].map({'sim': True, 'não': False})
model_identifications['model_classification'] = model_identifications['parsed_content'].map({True: True, False: False, None: False})

manual_identifications['DataHora'] = manual_identifications['DataHora'].apply(convert_to_iso)

merged_data = pd.merge(
    manual_identifications, 
    model_identifications, 
    left_on='id', 
    right_on='instagram_post_id'
)

true_matches = merged_data[
    (merged_data['manual_classification'] == True) & 
    (merged_data['model_classification'] == True)
]

final_data = pd.merge(
    true_matches,
    post_analyses,
    on='instagram_post_id',
    how='inner'
)

final_filtered_data = final_data[[
    'rhyme_battle_id_x',
    'Localização',
    'DataHora',
    'raw_content_y',
    'parsed_content_y',
    'manual_classification',
    'model_classification'
]]

final_filtered_data = final_filtered_data.rename(columns={
    'rhyme_battle_id_x': 'rhyme_battle_id',
    'raw_content_y': 'raw_content',
    'parsed_content_y': 'parsed_content'
})

final_filtered_data.to_csv('final_filtered_matches.csv', index=False)

print(final_filtered_data)

print(f"\nQuantidade de matches verdadeiros inicial: {len(true_matches)}")
print(f"Quantidade após merge com post_analyses: {len(final_data)}")
print(f"Quantidade final após filtro de colunas: {len(final_filtered_data)}")