# Estado del enriquecimiento de vocabulario

Fecha de la última ejecución: 2026-08-20.

Se integraron mediante generación asistida y validación estructural **4.092 entradas nuevas** en las lecciones de italiano, portugués y alemán. La validación local confirma que **180 de 216 lecciones** alcanzan al menos 30 tarjetas y al menos cuatro expresiones útiles.

Quedaron **36 lecciones pendientes**. No se añadieron textos inventados ni marcadores: las llamadas al modelo devolvieron una respuesta vacía porque el proxy informó `Insufficient credits` (`available_credits: -3`). El inventario exacto se conserva en `/tmp/three_language_vocab_failures.json` y el resultado reanudable en `/tmp/three_language_vocab_enrichment_partial.json`.

El generador reanudable es `/tmp/generate_three_language_vocab_resumable.py`; cuando haya créditos disponibles, puede ejecutarse nuevamente y solo intentará las lecciones que sigan pendientes. Las tarjetas integradas conservan el formato existente y las entradas de categoría `expression` se renderizan con la expresión arriba y la traducción debajo mediante la lógica ya desplegada.
