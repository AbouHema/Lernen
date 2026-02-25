const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

const vocabularyByLevel = {
  A1: [
    ["a1-v1", "مرحبا", "Hallo", "", "Hallo! Wie geht es dir?", "مرحبا! كيف حالك؟", ["Begrüßung", "Alltag"]],
    ["a1-v2", "بيت", "Haus", "das", "Das Haus ist klein.", "البيت صغير.", ["Wohnen"]],
    ["a1-v3", "مدرسة", "Schule", "die", "Die Schule beginnt um acht.", "تبدأ المدرسة في الثامنة.", ["Lernen"]],
    ["a1-v4", "كتاب", "Buch", "das", "Ich lese ein Buch.", "أنا أقرأ كتابًا.", ["Lernen"]],
    ["a1-v5", "ماء", "Wasser", "das", "Ich trinke Wasser.", "أنا أشرب ماء.", ["Essen"]],
    ["a1-v6", "خبز", "Brot", "das", "Das Brot ist frisch.", "الخبز طازج.", ["Essen"]],
    ["a1-v7", "صديق", "Freund", "der", "Mein Freund ist nett.", "صديقي لطيف.", ["Personen"]],
    ["a1-v8", "عائلة", "Familie", "die", "Meine Familie wohnt hier.", "عائلتي تعيش هنا.", ["Personen"]],
    ["a1-v9", "مدينة", "Stadt", "die", "Berlin ist eine große Stadt.", "برلين مدينة كبيرة.", ["Orte"]],
    ["a1-v10", "عمل", "Arbeit", "die", "Ich habe heute Arbeit.", "لدي عمل اليوم.", ["Alltag"]],
    ["a1-v11", "سيارة", "Auto", "das", "Das Auto ist neu.", "السيارة جديدة.", ["Transport"]],
    ["a1-v12", "وقت", "Zeit", "die", "Ich habe keine Zeit.", "ليس لدي وقت.", ["Alltag"]],
    ["a1-v13", "يوم", "Tag", "der", "Heute ist ein schöner Tag.", "اليوم يوم جميل.", ["Zeit"]],
    ["a1-v14", "ليل", "Nacht", "die", "In der Nacht ist es ruhig.", "في الليل يكون الجو هادئًا.", ["Zeit"]],
    ["a1-v15", "لغة", "Sprache", "die", "Deutsch ist eine schöne Sprache.", "الألمانية لغة جميلة.", ["Lernen"]]
  ],
  A2: [
    ["a2-v1", "موعد", "Termin", "der", "Ich habe morgen einen Termin.", "لدي موعد غدًا.", ["Alltag"]],
    ["a2-v2", "رحلة", "Reise", "die", "Die Reise war sehr schön.", "كانت الرحلة جميلة جدًا.", ["Freizeit"]],
    ["a2-v3", "طبيب", "Arzt", "der", "Der Arzt ist freundlich.", "الطبيب ودود.", ["Gesundheit"]],
    ["a2-v4", "دواء", "Medikament", "das", "Ich nehme das Medikament am Abend.", "آخذ الدواء مساءً.", ["Gesundheit"]],
    ["a2-v5", "سوق", "Markt", "der", "Wir kaufen Obst auf dem Markt.", "نشتري الفواكه من السوق.", ["Einkauf"]],
    ["a2-v6", "سؤال", "Frage", "die", "Das ist eine gute Frage.", "هذا سؤال جيد.", ["Kommunikation"]],
    ["a2-v7", "إجابة", "Antwort", "die", "Ich kenne die Antwort.", "أنا أعرف الإجابة.", ["Kommunikation"]],
    ["a2-v8", "قطار", "Zug", "der", "Der Zug kommt pünktlich.", "القطار يصل في الوقت.", ["Transport"]],
    ["a2-v9", "محطة", "Bahnhof", "der", "Der Bahnhof ist nah.", "المحطة قريبة.", ["Transport"]],
    ["a2-v10", "طقس", "Wetter", "das", "Das Wetter ist heute kalt.", "الطقس بارد اليوم.", ["Alltag"]],
    ["a2-v11", "عطلة", "Urlaub", "der", "Im Urlaub lese ich viel.", "في العطلة أقرأ كثيرًا.", ["Freizeit"]],
    ["a2-v12", "مشكلة", "Problem", "das", "Wir lösen das Problem zusammen.", "نحل المشكلة معًا.", ["Alltag"]],
    ["a2-v13", "مساعدة", "Hilfe", "die", "Danke für deine Hilfe.", "شكرًا على مساعدتك.", ["Alltag"]],
    ["a2-v14", "مكتب", "Büro", "das", "Ich arbeite im Büro.", "أعمل في المكتب.", ["Arbeit"]],
    ["a2-v15", "رسالة", "Nachricht", "die", "Ich sende dir eine Nachricht.", "أرسل لك رسالة.", ["Kommunikation"]]
  ],
  B1: [
    ["b1-v1", "تجربة", "Erfahrung", "die", "Die Erfahrung hilft mir im Alltag.", "التجربة تساعدني في الحياة اليومية.", ["Alltag"]],
    ["b1-v2", "تحدي", "Herausforderung", "die", "Die Herausforderung motiviert mich.", "التحدي يحفزني.", ["Alltag"]],
    ["b1-v3", "قرار", "Entscheidung", "die", "Ich treffe eine wichtige Entscheidung.", "أتخذ قرارًا مهمًا.", ["Alltag"]],
    ["b1-v4", "تغيير", "Veränderung", "die", "Die Veränderung war positiv.", "كان التغيير إيجابيًا.", ["Alltag"]],
    ["b1-v5", "نصيحة", "Ratschlag", "der", "Danke für deinen Ratschlag.", "شكرًا على نصيحتك.", ["Alltag"]],
    ["b1-v6", "ثقة", "Vertrauen", "das", "Vertrauen ist wichtig.", "الثقة مهمة.", ["Alltag"]],
    ["b1-v7", "شهية", "Appetit", "der", "Ich habe keinen Appetit.", "لا شهية لدي.", ["Essen"]],
    ["b1-v8", "حساسية", "Allergie", "die", "Ich habe eine Allergie gegen Nüsse.", "لدي حساسية من المكسرات.", ["Gesundheit", "Essen"]],
    ["b1-v9", "حجز", "Reservierung", "die", "Ich habe eine Reservierung um acht.", "لدي حجز الساعة الثامنة.", ["Essen"]],
    ["b1-v10", "ترقية", "Beförderung", "die", "Sie wartet auf eine Beförderung.", "هي تنتظر ترقية.", ["Arbeit"]],
    ["b1-v11", "مسؤولية", "Verantwortung", "die", "Verantwortung gehört zu meinem Job.", "المسؤولية جزء من عملي.", ["Arbeit"]],
    ["b1-v12", "تقرير", "Bericht", "der", "Der Bericht ist fast fertig.", "التقرير شبه جاهز.", ["Arbeit"]],
    ["b1-v13", "مريض", "Symptom", "das", "Das Symptom ist neu.", "العَرَض جديد.", ["Gesundheit"]],
    ["b1-v14", "إيجار", "Miete", "die", "Die Miete ist gestiegen.", "ارتفع الإيجار.", ["Wohnen"]],
    ["b1-v15", "حي", "Nachbarschaft", "die", "Die Nachbarschaft ist ruhig.", "الحي هادئ.", ["Wohnen"]]
  ],
  B2: [
    ["b2-v1", "افتراض", "Annahme", "die", "Diese Annahme ist nicht korrekt.", "هذا الافتراض غير صحيح.", ["Akademisch"]],
    ["b2-v2", "جدل", "Debatte", "die", "Die Debatte war sehr spannend.", "كان الجدل ممتعًا جدًا.", ["Gesellschaft"]],
    ["b2-v3", "تحليل", "Analyse", "die", "Die Analyse zeigt klare Trends.", "يُظهر التحليل اتجاهات واضحة.", ["Akademisch"]],
    ["b2-v4", "إقناع", "überzeugen", "", "Gute Argumente überzeugen das Publikum.", "الحجج الجيدة تقنع الجمهور.", ["Kommunikation"]],
    ["b2-v5", "استدامة", "Nachhaltigkeit", "die", "Nachhaltigkeit spielt eine große Rolle.", "الاستدامة تلعب دورًا كبيرًا.", ["Umwelt"]],
    ["b2-v6", "تأثير", "Auswirkung", "die", "Die Auswirkung ist langfristig.", "التأثير طويل الأمد.", ["Gesellschaft"]],
    ["b2-v7", "تقييم", "Bewertung", "die", "Wir brauchen eine faire Bewertung.", "نحتاج تقييمًا عادلًا.", ["Arbeit"]],
    ["b2-v8", "تعاون", "Zusammenarbeit", "die", "Die Zusammenarbeit funktioniert gut.", "التعاون يعمل بشكل جيد.", ["Arbeit"]],
    ["b2-v9", "منهج", "Konzept", "das", "Das Konzept ist innovativ.", "المفهوم مبتكر.", ["Akademisch"]],
    ["b2-v10", "احتمال", "Wahrscheinlichkeit", "die", "Die Wahrscheinlichkeit ist gering.", "الاحتمال منخفض.", ["Akademisch"]],
    ["b2-v11", "تنفيذ", "Umsetzung", "die", "Die Umsetzung dauert zwei Monate.", "التنفيذ يستغرق شهرين.", ["Projekt"]],
    ["b2-v12", "اعتراض", "Einwand", "der", "Sein Einwand war berechtigt.", "كان اعتراضه مبررًا.", ["Kommunikation"]],
    ["b2-v13", "مبدأ", "Prinzip", "das", "Dieses Prinzip gilt überall.", "هذا المبدأ ينطبق في كل مكان.", ["Gesellschaft"]],
    ["b2-v14", "تحسين", "Optimierung", "die", "Die Optimierung spart Zeit.", "التحسين يوفر الوقت.", ["Arbeit"]],
    ["b2-v15", "مصدر", "Quelle", "die", "Bitte nenne deine Quelle.", "من فضلك اذكر مصدرك.", ["Akademisch"]]
  ],
  C1: [
    ["c1-v1", "منظور", "Perspektive", "die", "Eine neue Perspektive erweitert das Denken.", "منظور جديد يوسّع التفكير.", ["Diskurs"]],
    ["c1-v2", "طرح", "These", "die", "Die These wurde präzise begründet.", "تم تبرير الطرح بدقة.", ["Akademisch"]],
    ["c1-v3", "مفارقة", "Paradoxon", "das", "Das Paradoxon wirkt zunächst widersprüchlich.", "تبدو المفارقة متناقضة في البداية.", ["Diskurs"]],
    ["c1-v4", "تعقيد", "Komplexität", "die", "Die Komplexität des Problems ist hoch.", "تعقيد المشكلة مرتفع.", ["Akademisch"]],
    ["c1-v5", "سياق", "Kontext", "der", "Im historischen Kontext ist das verständlich.", "في السياق التاريخي يصبح ذلك مفهومًا.", ["Akademisch"]],
    ["c1-v6", "تحليل نقدي", "kritische Analyse", "die", "Die kritische Analyse ist differenziert.", "التحليل النقدي متوازن.", ["Akademisch"]],
    ["c1-v7", "استدلال", "Schlussfolgerung", "die", "Diese Schlussfolgerung ist nachvollziehbar.", "هذا الاستدلال منطقي.", ["Diskurs"]],
    ["c1-v8", "إطار", "Rahmenbedingung", "die", "Die Rahmenbedingungen ändern sich ständig.", "تتغير الشروط الإطارية باستمرار.", ["Gesellschaft"]],
    ["c1-v9", "رواية", "Narrativ", "das", "Das Narrativ prägt die öffentliche Meinung.", "تؤثر السردية في الرأي العام.", ["Medien"]],
    ["c1-v10", "تناقض", "Widerspruch", "der", "Wir müssen den Widerspruch auflösen.", "يجب أن نحل التناقض.", ["Diskurs"]],
    ["c1-v11", "حياد", "Neutralität", "die", "Journalistische Neutralität ist zentral.", "الحياد الصحفي أساسي.", ["Medien"]],
    ["c1-v12", "دلالة", "Implikation", "die", "Die Implikationen sind weitreichend.", "الدلالات بعيدة المدى.", ["Akademisch"]],
    ["c1-v13", "تحول", "Transformation", "die", "Die digitale Transformation beschleunigt Prozesse.", "يسرّع التحول الرقمي العمليات.", ["Gesellschaft"]],
    ["c1-v14", "ترابط", "Interdependenz", "die", "Globale Interdependenz ist sichtbar.", "الترابط العالمي واضح.", ["Gesellschaft"]],
    ["c1-v15", "تأمل", "Reflexion", "die", "Reflexion verbessert die Argumentation.", "التأمل يحسن بناء الحجة.", ["Diskurs"]]
  ]
};

const sentencesByLevel = {
  A1: [
    ["a1-s1", "أنا أتعلم الألمانية كل يوم.", "Ich lerne jeden Tag Deutsch.", "Lernen"],
    ["a1-s2", "أسكن في مدينة صغيرة.", "Ich wohne in einer kleinen Stadt.", "Wohnen"],
    ["a1-s3", "هذا صديقي من المدرسة.", "Das ist mein Freund aus der Schule.", "Personen"],
    ["a1-s4", "نأكل الخبز في الصباح.", "Wir essen morgens Brot.", "Essen"],
    ["a1-s5", "القطار يصل في الساعة التاسعة.", "Der Zug kommt um neun Uhr.", "Transport"],
    ["a1-s6", "هل تتكلم العربية؟", "Sprichst du Arabisch?", "Kommunikation"],
    ["a1-s7", "أذهب إلى العمل بالحافلة.", "Ich fahre mit dem Bus zur Arbeit.", "Alltag"],
    ["a1-s8", "الجو جميل اليوم.", "Das Wetter ist heute schön.", "Alltag"],
    ["a1-s9", "أحتاج إلى بعض الماء.", "Ich brauche etwas Wasser.", "Essen"],
    ["a1-s10", "في المساء أقرأ كتابًا.", "Am Abend lese ich ein Buch.", "Lernen"]
  ],
  A2: [
    ["a2-s1", "بعد العمل أذهب إلى السوق.", "Nach der Arbeit gehe ich zum Markt.", "Alltag"],
    ["a2-s2", "لدي موعد عند الطبيب غدًا.", "Ich habe morgen einen Termin beim Arzt.", "Gesundheit"],
    ["a2-s3", "سأرسل لك رسالة مساءً.", "Ich schicke dir heute Abend eine Nachricht.", "Kommunikation"],
    ["a2-s4", "الرحلة إلى ميونخ كانت مريحة.", "Die Reise nach München war angenehm.", "Freizeit"],
    ["a2-s5", "إذا احتجت مساعدة، اتصل بي.", "Wenn du Hilfe brauchst, ruf mich an.", "Alltag"],
    ["a2-s6", "القطار متأخر عشر دقائق.", "Der Zug hat zehn Minuten Verspätung.", "Transport"],
    ["a2-s7", "هذا السؤال صعب قليلًا.", "Diese Frage ist ein bisschen schwierig.", "Lernen"],
    ["a2-s8", "أخذ الدواء بعد الأكل.", "Nimm das Medikament nach dem Essen.", "Gesundheit"],
    ["a2-s9", "الطقس متغير هذا الأسبوع.", "Das Wetter ist diese Woche wechselhaft.", "Alltag"],
    ["a2-s10", "في العطلة سنزور عائلتي.", "Im Urlaub besuchen wir meine Familie.", "Freizeit"]
  ],
  B1: [
    ["b1-s1", "على الرغم من ضغط العمل، أجد وقتًا للدراسة.", "Trotz des Arbeitsdrucks finde ich Zeit zum Lernen.", "Alltag"],
    ["b1-s2", "أحاول تحسين لغتي من خلال قراءة المقالات.", "Ich versuche, meine Sprache durch Lesen zu verbessern.", "Lernen"],
    ["b1-s3", "إذا كان لدي وقت، أذهب للمشي في الحديقة.", "Wenn ich Zeit habe, gehe ich im Park spazieren.", "Alltag"],
    ["b1-s4", "أحتاج إلى نصيحتك حول هذا القرار.", "Ich brauche deinen Rat zu dieser Entscheidung.", "Kommunikation"],
    ["b1-s5", "أفضل تناول الطعام في المنزل لتجنب التكاليف.", "Ich esse lieber zu Hause, um Kosten zu sparen.", "Essen"],
    ["b1-s6", "هل لديك أي حساسية يجب أن أخبر بها المطبخ؟", "Hast du Allergien, die ich der Küche mitteilen soll?", "Essen"],
    ["b1-s7", "تمت ترقية زميلي لأنه أظهر مبادرة.", "Mein Kollege wurde befördert, weil er Initiative gezeigt hat.", "Arbeit"],
    ["b1-s8", "نحتاج إلى تنسيق قبل إرسال التقرير.", "Wir brauchen eine Abstimmung, bevor wir den Bericht senden.", "Arbeit"],
    ["b1-s9", "أشعر بتحسن لكن الأعراض لم تختف تمامًا.", "Ich fühle mich besser, aber die Symptome sind nicht ganz verschwunden.", "Gesundheit"],
    ["b1-s10", "أود مناقشة بنود عقد الإيجار بالتفصيل.", "Ich möchte die Punkte des Mietvertrags im Detail besprechen.", "Wohnen"]
  ],
  B2: [
    ["b2-s1", "هذا التحليل يوضح التأثيرات بعيدة المدى.", "Diese Analyse verdeutlicht langfristige Auswirkungen.", "Akademisch"],
    ["b2-s2", "خلال النقاش قدمتُ حججًا مقنعة.", "In der Debatte habe ich überzeugende Argumente geliefert.", "Kommunikation"],
    ["b2-s3", "من الضروري تقييم النتائج بموضوعية.", "Es ist wichtig, die Ergebnisse objektiv zu bewerten.", "Arbeit"],
    ["b2-s4", "نعمل على تنفيذ المفهوم الجديد تدريجيًا.", "Wir arbeiten an der schrittweisen Umsetzung des neuen Konzepts.", "Projekt"],
    ["b2-s5", "احتمال النجاح يرتفع مع التخطيط الجيد.", "Die Wahrscheinlichkeit des Erfolgs steigt mit guter Planung.", "Akademisch"],
    ["b2-s6", "الاستدامة أصبحت معيارًا أساسيًا في الشركة.", "Nachhaltigkeit ist in der Firma zu einem zentralen Kriterium geworden.", "Umwelt"],
    ["b2-s7", "قدم الزميل اعتراضًا منطقيًا أثناء الاجتماع.", "Der Kollege brachte während des Meetings einen logischen Einwand vor.", "Arbeit"],
    ["b2-s8", "نحتاج إلى تحسين التعاون بين الأقسام.", "Wir müssen die Zusammenarbeit zwischen den Abteilungen verbessern.", "Arbeit"],
    ["b2-s9", "هذا المبدأ يساعدنا على اتخاذ قرارات عادلة.", "Dieses Prinzip hilft uns, faire Entscheidungen zu treffen.", "Gesellschaft"],
    ["b2-s10", "تم توثيق المصدر بدقة في التقرير.", "Die Quelle wurde im Bericht präzise dokumentiert.", "Akademisch"]
  ],
  C1: [
    ["c1-s1", "لا يمكن فهم هذه القضية دون النظر إلى السياق التاريخي.", "Diese Frage lässt sich ohne den historischen Kontext nicht verstehen.", "Diskurs"],
    ["c1-s2", "تبدو الفرضية متماسكة، لكنها تتجاهل عدة مفارقات.", "Die These wirkt schlüssig, ignoriert jedoch mehrere Paradoxien.", "Akademisch"],
    ["c1-s3", "يتطلب النقاش مستوى عاليًا من الدقة المفاهيمية.", "Die Debatte erfordert ein hohes Maß an begrifflicher Präzision.", "Diskurs"],
    ["c1-s4", "الاستدلال الذي قدمته الباحثة قابل للدفاع علميًا.", "Die Schlussfolgerung der Forscherin ist wissenschaftlich gut begründbar.", "Akademisch"],
    ["c1-s5", "التداخل بين العوامل الاجتماعية والاقتصادية يزيد التعقيد.", "Die Interdependenz sozialer und ökonomischer Faktoren erhöht die Komplexität.", "Gesellschaft"],
    ["c1-s6", "علينا تفكيك هذا السرد الإعلامي بشكل نقدي.", "Wir sollten dieses mediale Narrativ kritisch dekonstruieren.", "Medien"],
    ["c1-s7", "الحياد الكامل في هذا الموضوع يبدو غير واقعي.", "Vollständige Neutralität erscheint in diesem Themenfeld unrealistisch.", "Diskurs"],
    ["c1-s8", "التحول الرقمي يغيّر الشروط الإطارية للعمل الأكاديمي.", "Die digitale Transformation verändert die Rahmenbedingungen wissenschaftlicher Arbeit.", "Gesellschaft"],
    ["c1-s9", "النتائج تحمل دلالات سياسية لا يمكن تجاهلها.", "Die Ergebnisse haben politische Implikationen, die nicht ignoriert werden können.", "Diskurs"],
    ["c1-s10", "يساعد التأمل المنتظم على صقل بنية الحجة.", "Regelmäßige Reflexion schärft die Struktur der Argumentation.", "Akademisch"]
  ]
};

const vocabulary = LEVELS.flatMap((level) =>
  vocabularyByLevel[level].map(([id, arabic, german, article, example_de, example_ar, tags]) => ({
    id,
    arabic,
    german,
    article,
    example_de,
    example_ar,
    tags,
    level
  }))
);

const sentences = LEVELS.flatMap((level) =>
  sentencesByLevel[level].map(([id, arabic, german, tag]) => ({
    id,
    arabic,
    german,
    tag,
    level
  }))
);

const exercises = LEVELS.flatMap((level) => {
  const levelVocab = vocabulary.filter((item) => item.level === level).map((item) => item.id);
  const levelSentences = sentences.filter((item) => item.level === level).map((item) => item.id);

  return [
    { id: `${level.toLowerCase()}-flash-1`, type: "flashcards", level, vocabularyIds: levelVocab.slice(0, 8) },
    {
      id: `${level.toLowerCase()}-multiple-1`,
      type: "multiple",
      level,
      promptWordId: levelVocab[0],
      optionWordIds: [levelVocab[0], levelVocab[1], levelVocab[2], levelVocab[3]],
      correctWordId: levelVocab[0]
    },
    { id: `${level.toLowerCase()}-gap-1`, type: "gap", level, sentenceId: levelSentences[0] },
    { id: `${level.toLowerCase()}-quiz-1`, type: "quiz", level, questionWordIds: levelVocab.slice(0, 5) }
  ];
});
