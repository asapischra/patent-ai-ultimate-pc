export const SYSTEM_INSTRUCTION = `
RÔLE : Expert en Propriété Intellectuelle et Ingénieur Brevet Senior.
PERSONA : "L'Homme du Métier" - Ingénieur moyen, sans imagination, disposant de toutes les connaissances techniques.

MÉTHODOLOGIE STRICTE OBLIGATOIRE :
1. APPROCHE PROBLÈME-SOLUTION : État de l'art -> Différence -> Effet Technique -> Problème Objectif -> Solution.
2. MÉTHODE FAST : Décortiquer en Fonctions et Moyens.
3. GRAMMAIRE BREVET (BASE D'ANTÉCÉDENCE) :
   - 1ère mention = Article INDÉFINI ("un", "une", "des").
   - Mentions suivantes = Article DÉFINI ("le", "la", "ledit", "ladite").

OBJECTIF : Produire des analyses défendables juridiquement.
`;

export const PROMPTS = {
  step1_analyze: `
    TÂCHE : DISSECTION FONCTIONNELLE (MÉTHODE FAST)
    ANALYSE LE DOCUMENT SUIVANT.
    
    1. FONCTION PRINCIPALE : But unique de l'invention.
    2. ARBORESCENCE CAUSALE : Identifie les Moyens et leurs interactions (Verbes d'action).
    3. LE TRIPLET D'OR : Problème Technique, Solution Technique, Résultat.
    4. FAST FACTS : Liste des faits techniques purs.
    
    FORMAT JSON ATTENDU :
    {
      "title": "Titre technique",
      "main_function": "But unique",
      "fast_analysis": [
        { "function": "Fonction Technique", "means": "Moyen Physique" }
      ],
      "causal_chain": ["A actionne B", "B modifie C"],
      "triplet": { "problem": "...", "solution": "...", "result": "..." }
    }
    DOCUMENT : {{TEXT}}
  `,
  step2_strategy: `
    TÂCHE : STRATÉGIE DE RECHERCHE (EXTENSION)
    
    Basé sur l'analyse FAST précédente, génère une stratégie de recherche complète.
    
    1. MOTS-CLÉS : Synonymes techniques (FR/EN).
    2. CLASSES : Codes CPC/IPC pertinents.
    3. REQUÊTES BOOLÉENNES : Équations strictes pour base de données classique.
    4. PROMPT ORBIT (NOUVEAU) : Rédige un paragraphe de recherche sémantique en ANGLAIS, optimisé pour l'IA de Questel/Orbit.
       - Structure : "Find patents describing a [Nom du Système] comprising [Moyens A, B, C] configured to [Fonctions X, Y], in order to [Résultat Z]."
       - Utilise un vocabulaire technique précis.
       - Ne mets pas d'opérateurs booléens ici, juste du langage naturel dense.
    
    FORMAT JSON ATTENDU :
    {
      "keywords_fr": ["..."],
      "keywords_en": ["..."],
      "classifications": ["..."],
      "queries": ["..."],
      "orbit_prompt": "..."
    }
    
    ANALYSE PRÉCÉDENTE :
    {{PREVIOUS_JSON}}
  `,
  step3_compare: `
    TÂCHE : JEU DES 7 DIFFÉRENCES (CLAIM CHART)
    CONFRONTE l'Invention aux Antériorités (D1, D2...).
    
    RÈGLES :
    1. NOUVEAUTÉ : Comparaison binaire (PRÉSENT/ABSENT).
    2. ACTIVITÉ INVENTIVE : Si différence, est-elle évidente ?
    
    FORMAT JSON ATTENDU :
    {
      "claim_chart": [
        { 
          "feature": "Caractéristique Invention", 
          "d1_presence": "PRÉSENT/ABSENT/PARTIEL", 
          "d1_quote": "Preuve (citation)",
          "verdict": "IDENTIQUE/DIFFÉRENCE"
        }
      ],
      "novelty_analysis": "Analyse texte",
      "inventive_step_analysis": "Analyse évidence"
    }
    INVENTION : {{INVENTION_JSON}}
    DOCUMENTS : {{PRIOR_TEXT}}
  `,
  step4_report: `
    TÂCHE : RÉDACTION PROTOCOLAIRE
    Rédige le rapport final.
    IMPÉRATIF : Respecte la Règle d'Antécédence (Un... Le...).
    STRUCTURE : Préambule, Art Antérieur, Invention (Différences), Activité Inventive, Conclusion.
    FORMAT JSON ATTENDU : { "report_markdown": "# RAPPORT..." }
    DONNÉES : {{ALL_DATA}}
  `
};