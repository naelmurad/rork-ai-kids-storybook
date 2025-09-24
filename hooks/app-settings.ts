import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { AppSettings, UserProfile, UsageLimits } from '@/types/story';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Multi-language translations
const translations = {
  en: {
    appTitle: 'AI Kids Storybook',
    appSubtitle: 'Magical stories created just for your child',
    createNewStory: 'Create New Story',
    upgradeForMoreStories: 'Upgrade for More Stories',
    yourStories: 'Your Stories',
    noStoriesYet: 'No stories yet',
    noStoriesSubtext: 'Create your first magical story for your child',
    loadingStories: 'Loading stories...',
    dayStreak: 'Day Streak',
    storiesCreated: 'Stories Created',
    profiles: 'Profiles',
    dailyStories: 'Daily Stories',
    upgrade: 'Upgrade',
    childName: "Child's Name",
    childAge: "Child's Age",
    chooseTheme: 'Choose a Theme',
    language: 'Language',
    createStory: 'Create Story',
    generating: 'Generating...',
    cancel: 'Cancel',
    enterChildName: "Enter your child's name",
    enterAge: 'Age (1-12)',
    oops: 'Oops!',
    ok: 'OK',
    pleaseEnterName: "Please enter your child's name",
    pleaseEnterValidAge: 'Please enter a valid age between 1 and 12',
    failedToGenerate: 'Failed to generate story. Please try again.',
    addAvatar: 'Add Avatar',
    uploadPhoto: 'Upload Photo',
    takePhoto: 'Take Photo',
    chooseFromLibrary: 'Choose from Library',
    converting: 'Converting...',
    createNewStoryTitle: 'Create New Story',
    numberOfPages: 'Number of Pages',
    statistics: 'Statistics',
    settings: 'Settings',
    stories: 'Stories',
    library: 'Library',
    storyType: 'Story Type',
    textOnly: 'Text Only',
    withIllustrations: 'With Illustrations',
    optional: 'Optional',
    changePhoto: 'Change Photo',
    autoGenerate: 'Auto Generate',
    describeTheme: 'Describe your theme:',
    familyProfiles: 'Family Profiles',
    subscription: 'Subscription',
    currentStreak: 'Current Streak',
    longestStreak: 'Longest Streak',
    selectGender: 'Select Gender',
    boy: 'Boy',
    girl: 'Girl',
    pleaseFillRequiredFields: 'Please fill in all required fields',
    pleaseEnterCustomTheme: 'Please enter a custom theme description',
    theme_adventure: 'Adventure',
    theme_princess: 'Princess',
    theme_space: 'Space',
    theme_forest: 'Forest',
    theme_ocean: 'Ocean',
    theme_magic: 'Magic',
    theme_castle: 'Castle',
    theme_superhero: 'Superhero',
    theme_friendship: 'Friendship',
    theme_dreams: 'Dreams',
    theme_sunny_day: 'Sunny Day',
    theme_moonlight: 'Moonlight',
    theme_garden: 'Garden',
    theme_underwater: 'Underwater',
    theme_racing: 'Racing',
    theme_flying: 'Flying',
    theme_train_journey: 'Train Journey',
    theme_pirate_ship: 'Pirate Ship',
    theme_musical: 'Musical',
    theme_artistic: 'Artistic',
    theme_photography: 'Photography',
    theme_library: 'Library',
    theme_birthday: 'Birthday',
    theme_party: 'Party',
    theme_carnival: 'Carnival',
    theme_winter: 'Winter',
    theme_autumn: 'Autumn',
    theme_mountain: 'Mountain',
    theme_beach: 'Beach',
    theme_city: 'City',
    theme_custom: 'Custom',
    customThemePlaceholder: 'e.g., underwater adventure with dolphins',
    badges: 'Badges',
    earnedBadges: 'Earned Badges',
    lockedBadges: 'Locked Badges',
    unlockAtStories: 'Complete {count} stories to unlock',
  },
  es: {
    appTitle: 'Cuentos IA para Niños',
    appSubtitle: 'Historias mágicas creadas especialmente para tu hijo',
    createNewStory: 'Crear Nueva Historia',
    upgradeForMoreStories: 'Actualizar para Más Historias',
    yourStories: 'Tus Historias',
    noStoriesYet: 'Aún no hay historias',
    noStoriesSubtext: 'Crea la primera historia mágica para tu hijo',
    loadingStories: 'Cargando historias...',
    dayStreak: 'Días Consecutivos',
    storiesCreated: 'Historias Creadas',
    profiles: 'Perfiles',
    dailyStories: 'Historias Diarias',
    upgrade: 'Actualizar',
    childName: 'Nombre del Niño',
    childAge: 'Edad del Niño',
    chooseTheme: 'Elige un Tema',
    language: 'Idioma',
    createStory: 'Crear Historia',
    generating: 'Generando...',
    cancel: 'Cancelar',
    enterChildName: 'Ingresa el nombre de tu hijo',
    enterAge: 'Edad (1-12)',
    oops: '¡Ups!',
    ok: 'OK',
    pleaseEnterName: 'Por favor ingresa el nombre de tu hijo',
    pleaseEnterValidAge: 'Por favor ingresa una edad válida entre 1 y 12',
    failedToGenerate: 'Error al generar la historia. Inténtalo de nuevo.',
    addAvatar: 'Agregar Avatar',
    uploadPhoto: 'Subir Foto',
    takePhoto: 'Tomar Foto',
    chooseFromLibrary: 'Elegir de la Biblioteca',
    converting: 'Convirtiendo...',
    createNewStoryTitle: 'Crear Nueva Historia',
    numberOfPages: 'Número de Páginas',
    statistics: 'Estadísticas',
    settings: 'Configuración',
    stories: 'Historias',
    library: 'Biblioteca',
    storyType: 'Tipo de Historia',
    textOnly: 'Solo Texto',
    withIllustrations: 'Con Ilustraciones',
    optional: 'Opcional',
    changePhoto: 'Cambiar Foto',
    autoGenerate: 'Generar Automáticamente',
    describeTheme: 'Describe tu tema:',
    familyProfiles: 'Perfiles Familiares',
    subscription: 'Suscripción',
    currentStreak: 'Racha Actual',
    longestStreak: 'Racha Más Larga',
    selectGender: 'Seleccionar Género',
    boy: 'Niño',
    girl: 'Niña',
    pleaseFillRequiredFields: 'Por favor completa todos los campos requeridos',
    pleaseEnterCustomTheme: 'Por favor ingresa una descripción del tema personalizado',
    theme_adventure: 'Aventura',
    theme_princess: 'Princesa',
    theme_space: 'Espacio',
    theme_forest: 'Bosque',
    theme_ocean: 'Océano',
    theme_magic: 'Magia',
    theme_castle: 'Castillo',
    theme_superhero: 'Superhéroe',
    theme_friendship: 'Amistad',
    theme_dreams: 'Sueños',
    theme_sunny_day: 'Día Soleado',
    theme_moonlight: 'Luz de Luna',
    theme_garden: 'Jardín',
    theme_underwater: 'Bajo el Agua',
    theme_racing: 'Carreras',
    theme_flying: 'Volando',
    theme_train_journey: 'Viaje en Tren',
    theme_pirate_ship: 'Barco Pirata',
    theme_musical: 'Musical',
    theme_artistic: 'Artístico',
    theme_photography: 'Fotografía',
    theme_library: 'Biblioteca',
    theme_birthday: 'Cumpleaños',
    theme_party: 'Fiesta',
    theme_carnival: 'Carnaval',
    theme_winter: 'Invierno',
    theme_autumn: 'Otoño',
    theme_mountain: 'Montaña',
    theme_beach: 'Playa',
    theme_city: 'Ciudad',
    theme_custom: 'Personalizado',
    customThemePlaceholder: 'ej., aventura submarina con delfines',
    badges: 'Insignias',
    earnedBadges: 'Insignias Obtenidas',
    lockedBadges: 'Insignias Bloqueadas',
    unlockAtStories: 'Completa {count} historias para desbloquear',
  },
  fr: {
    appTitle: 'Livre d\'Histoires IA pour Enfants',
    appSubtitle: 'Histoires magiques créées spécialement pour votre enfant',
    createNewStory: 'Créer une Nouvelle Histoire',
    upgradeForMoreStories: 'Mettre à Niveau pour Plus d\'Histoires',
    yourStories: 'Vos Histoires',
    noStoriesYet: 'Aucune histoire pour le moment',
    noStoriesSubtext: 'Créez la première histoire magique pour votre enfant',
    loadingStories: 'Chargement des histoires...',
    dayStreak: 'Jours Consécutifs',
    storiesCreated: 'Histoires Créées',
    profiles: 'Profils',
    dailyStories: 'Histoires Quotidiennes',
    upgrade: 'Mettre à Niveau',
    childName: 'Nom de l\'Enfant',
    childAge: 'Âge de l\'Enfant',
    chooseTheme: 'Choisir un Thème',
    language: 'Langue',
    createStory: 'Créer une Histoire',
    generating: 'Génération...',
    cancel: 'Annuler',
    enterChildName: 'Entrez le nom de votre enfant',
    enterAge: 'Âge (1-12)',
    oops: 'Oups !',
    ok: 'OK',
    pleaseEnterName: 'Veuillez entrer le nom de votre enfant',
    pleaseEnterValidAge: 'Veuillez entrer un âge valide entre 1 et 12',
    failedToGenerate: 'Échec de la génération de l\'histoire. Veuillez réessayer.',
    addAvatar: 'Ajouter un Avatar',
    uploadPhoto: 'Télécharger une Photo',
    takePhoto: 'Prendre une Photo',
    chooseFromLibrary: 'Choisir dans la Bibliothèque',
    converting: 'Conversion...',
    createNewStoryTitle: 'Créer une Nouvelle Histoire',
    numberOfPages: 'Nombre de Pages',
    statistics: 'Statistiques',
    settings: 'Paramètres',
    stories: 'Histoires',
    library: 'Bibliothèque',
    storyType: 'Type d\'Histoire',
    textOnly: 'Texte Seulement',
    withIllustrations: 'Avec Illustrations',
    optional: 'Optionnel',
    changePhoto: 'Changer la Photo',
    autoGenerate: 'Générer Automatiquement',
    describeTheme: 'Décrivez votre thème :',
    familyProfiles: 'Profils Familiaux',
    subscription: 'Abonnement',
    currentStreak: 'Série Actuelle',
    longestStreak: 'Plus Longue Série',
    selectGender: 'Sélectionner le Genre',
    boy: 'Garçon',
    girl: 'Fille',
    pleaseFillRequiredFields: 'Veuillez remplir tous les champs requis',
    pleaseEnterCustomTheme: 'Veuillez entrer une description du thème personnalisé',
    theme_adventure: 'Aventure',
    theme_princess: 'Princesse',
    theme_space: 'Espace',
    theme_forest: 'Forêt',
    theme_ocean: 'Océan',
    theme_magic: 'Magie',
    theme_castle: 'Château',
    theme_superhero: 'Super-héros',
    theme_friendship: 'Amitié',
    theme_dreams: 'Rêves',
    theme_sunny_day: 'Jour Ensoleillé',
    theme_moonlight: 'Clair de Lune',
    theme_garden: 'Jardin',
    theme_underwater: 'Sous-marin',
    theme_racing: 'Course',
    theme_flying: 'Vol',
    theme_train_journey: 'Voyage en Train',
    theme_pirate_ship: 'Bateau Pirate',
    theme_musical: 'Musical',
    theme_artistic: 'Artistique',
    theme_photography: 'Photographie',
    theme_library: 'Bibliothèque',
    theme_birthday: 'Anniversaire',
    theme_party: 'Fête',
    theme_carnival: 'Carnaval',
    theme_winter: 'Hiver',
    theme_autumn: 'Automne',
    theme_mountain: 'Montagne',
    theme_beach: 'Plage',
    theme_city: 'Ville',
    theme_custom: 'Personnalisé',
    customThemePlaceholder: 'ex., aventure sous-marine avec des dauphins',
    badges: 'Badges',
    earnedBadges: 'Badges Gagnés',
    lockedBadges: 'Badges Verrouillés',
    unlockAtStories: 'Terminez {count} histoires pour débloquer',
  },
  it: {
    appTitle: 'Libro di Storie IA per Bambini',
    appSubtitle: 'Storie magiche create appositamente per il tuo bambino',
    createNewStory: 'Crea Nuova Storia',
    upgradeForMoreStories: 'Aggiorna per Più Storie',
    yourStories: 'Le Tue Storie',
    noStoriesYet: 'Nessuna storia ancora',
    noStoriesSubtext: 'Crea la prima storia magica per il tuo bambino',
    loadingStories: 'Caricamento storie...',
    dayStreak: 'Giorni Consecutivi',
    storiesCreated: 'Storie Create',
    profiles: 'Profili',
    dailyStories: 'Storie Giornaliere',
    upgrade: 'Aggiorna',
    childName: 'Nome del Bambino',
    childAge: 'Età del Bambino',
    chooseTheme: 'Scegli un Tema',
    language: 'Lingua',
    createStory: 'Crea Storia',
    generating: 'Generazione...',
    cancel: 'Annulla',
    enterChildName: 'Inserisci il nome del tuo bambino',
    enterAge: 'Età (1-12)',
    oops: 'Ops!',
    ok: 'OK',
    pleaseEnterName: 'Per favore inserisci il nome del tuo bambino',
    pleaseEnterValidAge: 'Per favore inserisci un\'età valida tra 1 e 12',
    failedToGenerate: 'Impossibile generare la storia. Riprova.',
    addAvatar: 'Aggiungi Avatar',
    uploadPhoto: 'Carica Foto',
    takePhoto: 'Scatta Foto',
    chooseFromLibrary: 'Scegli dalla Libreria',
    converting: 'Conversione...',
    createNewStoryTitle: 'Crea Nuova Storia',
    numberOfPages: 'Numero di Pagine',
    statistics: 'Statistiche',
    settings: 'Impostazioni',
    stories: 'Storie',
    library: 'Libreria',
    storyType: 'Tipo di Storia',
    textOnly: 'Solo Testo',
    withIllustrations: 'Con Illustrazioni',
    optional: 'Opzionale',
    changePhoto: 'Cambia Foto',
    autoGenerate: 'Genera Automaticamente',
    describeTheme: 'Descrivi il tuo tema:',
    familyProfiles: 'Profili Familiari',
    subscription: 'Abbonamento',
    currentStreak: 'Serie Attuale',
    longestStreak: 'Serie Più Lunga',
    selectGender: 'Seleziona Genere',
    boy: 'Maschio',
    girl: 'Femmina',
    pleaseFillRequiredFields: 'Per favore compila tutti i campi richiesti',
    pleaseEnterCustomTheme: 'Per favore inserisci una descrizione del tema personalizzato',
    theme_adventure: 'Avventura',
    theme_princess: 'Principessa',
    theme_space: 'Spazio',
    theme_forest: 'Foresta',
    theme_ocean: 'Oceano',
    theme_magic: 'Magia',
    theme_castle: 'Castello',
    theme_superhero: 'Supereroe',
    theme_friendship: 'Amicizia',
    theme_dreams: 'Sogni',
    theme_sunny_day: 'Giornata Soleggiata',
    theme_moonlight: 'Chiaro di Luna',
    theme_garden: 'Giardino',
    theme_underwater: 'Sott\'acqua',
    theme_racing: 'Corse',
    theme_flying: 'Volo',
    theme_train_journey: 'Viaggio in Treno',
    theme_pirate_ship: 'Nave Pirata',
    theme_musical: 'Musicale',
    theme_artistic: 'Artistico',
    theme_photography: 'Fotografia',
    theme_library: 'Biblioteca',
    theme_birthday: 'Compleanno',
    theme_party: 'Festa',
    theme_carnival: 'Carnevale',
    theme_winter: 'Inverno',
    theme_autumn: 'Autunno',
    theme_mountain: 'Montagna',
    theme_beach: 'Spiaggia',
    theme_city: 'Città',
    theme_custom: 'Personalizzato',
    customThemePlaceholder: 'es., avventura sottomarina con delfini',
    badges: 'Badge',
    earnedBadges: 'Badge Ottenuti',
    lockedBadges: 'Badge Bloccati',
    unlockAtStories: 'Completa {count} storie per sbloccare',
  },
  de: {
    appTitle: 'KI-Kinderbuch',
    appSubtitle: 'Magische Geschichten speziell für Ihr Kind erstellt',
    createNewStory: 'Neue Geschichte Erstellen',
    upgradeForMoreStories: 'Upgrade für Mehr Geschichten',
    yourStories: 'Ihre Geschichten',
    noStoriesYet: 'Noch keine Geschichten',
    noStoriesSubtext: 'Erstellen Sie die erste magische Geschichte für Ihr Kind',
    loadingStories: 'Geschichten werden geladen...',
    dayStreak: 'Tage in Folge',
    storiesCreated: 'Geschichten Erstellt',
    profiles: 'Profile',
    dailyStories: 'Tägliche Geschichten',
    upgrade: 'Upgrade',
    childName: 'Name des Kindes',
    childAge: 'Alter des Kindes',
    chooseTheme: 'Thema Wählen',
    language: 'Sprache',
    createStory: 'Geschichte Erstellen',
    generating: 'Generierung...',
    cancel: 'Abbrechen',
    enterChildName: 'Geben Sie den Namen Ihres Kindes ein',
    enterAge: 'Alter (1-12)',
    oops: 'Ups!',
    ok: 'OK',
    pleaseEnterName: 'Bitte geben Sie den Namen Ihres Kindes ein',
    pleaseEnterValidAge: 'Bitte geben Sie ein gültiges Alter zwischen 1 und 12 ein',
    failedToGenerate: 'Geschichte konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
    addAvatar: 'Avatar Hinzufügen',
    uploadPhoto: 'Foto Hochladen',
    takePhoto: 'Foto Aufnehmen',
    chooseFromLibrary: 'Aus Bibliothek Wählen',
    converting: 'Konvertierung...',
    createNewStoryTitle: 'Neue Geschichte Erstellen',
    numberOfPages: 'Anzahl der Seiten',
    statistics: 'Statistiken',
    settings: 'Einstellungen',
    stories: 'Geschichten',
    library: 'Bibliothek',
    storyType: 'Geschichtentyp',
    textOnly: 'Nur Text',
    withIllustrations: 'Mit Illustrationen',
    optional: 'Optional',
    changePhoto: 'Foto Ändern',
    autoGenerate: 'Automatisch Generieren',
    describeTheme: 'Beschreiben Sie Ihr Thema:',
    familyProfiles: 'Familienprofile',
    subscription: 'Abonnement',
    currentStreak: 'Aktuelle Serie',
    longestStreak: 'Längste Serie',
    selectGender: 'Geschlecht Auswählen',
    boy: 'Junge',
    girl: 'Mädchen',
    pleaseFillRequiredFields: 'Bitte füllen Sie alle erforderlichen Felder aus',
    pleaseEnterCustomTheme: 'Bitte geben Sie eine Beschreibung des benutzerdefinierten Themas ein',
    theme_adventure: 'Abenteuer',
    theme_princess: 'Prinzessin',
    theme_space: 'Weltraum',
    theme_forest: 'Wald',
    theme_ocean: 'Ozean',
    theme_magic: 'Magie',
    theme_castle: 'Schloss',
    theme_superhero: 'Superheld',
    theme_friendship: 'Freundschaft',
    theme_dreams: 'Träume',
    theme_sunny_day: 'Sonniger Tag',
    theme_moonlight: 'Mondschein',
    theme_garden: 'Garten',
    theme_underwater: 'Unterwasser',
    theme_racing: 'Rennen',
    theme_flying: 'Fliegen',
    theme_train_journey: 'Zugreise',
    theme_pirate_ship: 'Piratenschiff',
    theme_musical: 'Musical',
    theme_artistic: 'Künstlerisch',
    theme_photography: 'Fotografie',
    theme_library: 'Bibliothek',
    theme_birthday: 'Geburtstag',
    theme_party: 'Party',
    theme_carnival: 'Karneval',
    theme_winter: 'Winter',
    theme_autumn: 'Herbst',
    theme_mountain: 'Berg',
    theme_beach: 'Strand',
    theme_city: 'Stadt',
    theme_custom: 'Benutzerdefiniert',
    customThemePlaceholder: 'z.B., Unterwasserabenteuer mit Delfinen',
    badges: 'Abzeichen',
    earnedBadges: 'Erhaltene Abzeichen',
    lockedBadges: 'Gesperrte Abzeichen',
    unlockAtStories: 'Schließe {count} Geschichten ab, um freizuschalten',
  },
  zh: {
    appTitle: 'AI儿童故事书',
    appSubtitle: '为您的孩子量身定制的神奇故事',
    createNewStory: '创建新故事',
    upgradeForMoreStories: '升级获取更多故事',
    yourStories: '您的故事',
    noStoriesYet: '还没有故事',
    noStoriesSubtext: '为您的孩子创建第一个神奇故事',
    loadingStories: '正在加载故事...',
    dayStreak: '连续天数',
    storiesCreated: '已创建故事',
    profiles: '档案',
    dailyStories: '每日故事',
    upgrade: '升级',
    childName: '孩子姓名',
    childAge: '孩子年龄',
    chooseTheme: '选择主题',
    language: '语言',
    createStory: '创建故事',
    generating: '生成中...',
    cancel: '取消',
    enterChildName: '输入您孩子的姓名',
    enterAge: '年龄 (1-12)',
    oops: '哎呀！',
    ok: '确定',
    pleaseEnterName: '请输入您孩子的姓名',
    pleaseEnterValidAge: '请输入1到12之间的有效年龄',
    failedToGenerate: '生成故事失败。请重试。',
    addAvatar: '添加头像',
    uploadPhoto: '上传照片',
    takePhoto: '拍照',
    chooseFromLibrary: '从图库选择',
    converting: '转换中...',
    createNewStoryTitle: '创建新故事',
    numberOfPages: '页数',
    statistics: '统计',
    settings: '设置',
    stories: '故事',
    library: '图书馆',
    storyType: '故事类型',
    textOnly: '仅文本',
    withIllustrations: '带插图',
    optional: '可选',
    changePhoto: '更换照片',
    autoGenerate: '自动生成',
    describeTheme: '描述您的主题：',
    familyProfiles: '家庭档案',
    subscription: '订阅',
    currentStreak: '当前连续',
    longestStreak: '最长连续',
    selectGender: '选择性别',
    boy: '男孩',
    girl: '女孩',
    pleaseFillRequiredFields: '请填写所有必填字段',
    pleaseEnterCustomTheme: '请输入自定义主题描述',
    theme_adventure: '冒险',
    theme_princess: '公主',
    theme_space: '太空',
    theme_forest: '森林',
    theme_ocean: '海洋',
    theme_magic: '魔法',
    theme_castle: '城堡',
    theme_superhero: '超级英雄',
    theme_friendship: '友谊',
    theme_dreams: '梦想',
    theme_sunny_day: '阳光明媚的日子',
    theme_moonlight: '月光',
    theme_garden: '花园',
    theme_underwater: '水下',
    theme_racing: '赛车',
    theme_flying: '飞行',
    theme_train_journey: '火车之旅',
    theme_pirate_ship: '海盗船',
    theme_musical: '音乐剧',
    theme_artistic: '艺术',
    theme_photography: '摄影',
    theme_library: '图书馆',
    theme_birthday: '生日',
    theme_party: '派对',
    theme_carnival: '嘉年华',
    theme_winter: '冬天',
    theme_autumn: '秋天',
    theme_mountain: '山',
    theme_beach: '海滩',
    theme_city: '城市',
    theme_custom: '自定义',
    customThemePlaceholder: '例如，与海豚的水下冒险',
    badges: '徽章',
    earnedBadges: '已获得徽章',
    lockedBadges: '未解锁徽章',
    unlockAtStories: '完成{count}个故事可解锁',
  },
  ar: {
    appTitle: 'كتاب القصص الذكي للأطفال',
    appSubtitle: 'قصص سحرية مصممة خصيصا لطفلك',
    createNewStory: 'إنشاء قصة جديدة',
    upgradeForMoreStories: 'ترقية للمزيد من القصص',
    yourStories: 'قصصك',
    noStoriesYet: 'لا توجد قصص بعد',
    noStoriesSubtext: 'أنشئ أول قصة سحرية لطفلك',
    loadingStories: 'جاري تحميل القصص...',
    dayStreak: 'أيام متتالية',
    storiesCreated: 'القصص المنشأة',
    profiles: 'الملفات الشخصية',
    dailyStories: 'القصص اليومية',
    upgrade: 'ترقية',
    childName: 'اسم الطفل',
    childAge: 'عمر الطفل',
    chooseTheme: 'اختر موضوعا',
    language: 'اللغة',
    createStory: 'إنشاء قصة',
    generating: 'جاري الإنشاء...',
    cancel: 'إلغاء',
    enterChildName: 'أدخل اسم طفلك',
    enterAge: 'العمر (1-12)',
    oops: 'عذرا!',
    ok: 'موافق',
    pleaseEnterName: 'يرجى إدخال اسم طفلك',
    pleaseEnterValidAge: 'يرجى إدخال عمر صحيح بين 1 و 12',
    failedToGenerate: 'فشل في إنشاء القصة. يرجى المحاولة مرة أخرى.',
    addAvatar: 'إضافة صورة رمزية',
    uploadPhoto: 'رفع صورة',
    takePhoto: 'التقاط صورة',
    chooseFromLibrary: 'اختيار من المكتبة',
    converting: 'جاري التحويل...',
    createNewStoryTitle: 'إنشاء قصة جديدة',
    numberOfPages: 'عدد الصفحات',
    statistics: 'الإحصائيات',
    settings: 'الإعدادات',
    stories: 'القصص',
    library: 'المكتبة',
    storyType: 'نوع القصة',
    textOnly: 'نص فقط',
    withIllustrations: 'مع الرسوم',
    optional: 'اختياري',
    changePhoto: 'تغيير الصورة',
    autoGenerate: 'إنشاء تلقائي',
    describeTheme: 'اكتب موضوعك المخصص:',
    familyProfiles: 'الملفات الشخصية للعائلة',
    subscription: 'الاشتراك',
    currentStreak: 'السلسلة الحالية',
    longestStreak: 'أطول سلسلة',
    selectGender: 'اختر الجنس',
    boy: 'ولد',
    girl: 'بنت',
    pleaseFillRequiredFields: 'يرجى ملء جميع الحقول المطلوبة',
    pleaseEnterCustomTheme: 'يرجى إدخال وصف للموضوع المخصص',
    theme_adventure: 'مغامرة',
    theme_princess: 'أميرة',
    theme_space: 'فضاء',
    theme_forest: 'غابة',
    theme_ocean: 'محيط',
    theme_magic: 'سحر',
    theme_castle: 'قلعة',
    theme_superhero: 'بطل خارق',
    theme_friendship: 'صداقة',
    theme_dreams: 'أحلام',
    theme_sunny_day: 'يوم مشمس',
    theme_moonlight: 'ضوء القمر',
    theme_garden: 'حديقة',
    theme_underwater: 'تحت الماء',
    theme_racing: 'سباق',
    theme_flying: 'طيران',
    theme_train_journey: 'رحلة بالقطار',
    theme_pirate_ship: 'سفينة القراصنة',
    theme_musical: 'موسيقي',
    theme_artistic: 'فني',
    theme_photography: 'تصوير',
    theme_library: 'مكتبة',
    theme_birthday: 'عيد ميلاد',
    theme_party: 'حفلة',
    theme_carnival: 'كرنفال',
    theme_winter: 'شتاء',
    theme_autumn: 'خريف',
    theme_mountain: 'جبل',
    theme_beach: 'شاطئ',
    theme_city: 'مدينة',
    theme_custom: 'مخصص',
    customThemePlaceholder: 'مثال: مغامرة تحت الماء مع الدلافين',
    badges: 'الشارات',
    earnedBadges: 'الشارات المكتسبة',
    lockedBadges: 'الشارات المقفلة',
    unlockAtStories: 'أكمل {count} قصصًا لفتح',
  },
};

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'it' | 'de' | 'zh' | 'ar';

export const useTranslation = (language?: SupportedLanguage) => {
  const currentLanguage = language || 'en';
  
  const t = useCallback((key: keyof typeof translations.en): string => {
    return translations[currentLanguage as keyof typeof translations]?.[key] || translations.en[key] || key;
  }, [currentLanguage]);
  
  return { t, currentLanguage };
};



const SETTINGS_KEY = 'app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  isPremium: false,
  dailyStoriesUsed: 0,
  weeklyStoriesUsed: 0,
  lastUsageDate: new Date().toDateString(),
  lastWeeklyReset: new Date().toDateString(),
  currentStreak: 0,
  longestStreak: 0,
  profiles: [],
  hasSeenOnboarding: false,
  hasSelectedLanguage: false,
  language: 'en',
  lastSelectedGender: 'boy',
};

export const getUsageLimits = (isPremium: boolean): UsageLimits => ({
  dailyStories: isPremium ? 999 : 2,
  weeklyStories: isPremium ? 999 : 2,
  maxPages: isPremium ? 12 : 5,
  hasAds: !isPremium,
  canExportPDF: isPremium,
  multiLanguage: true, // Allow both languages for all users
});

// Helper function to get the start of the week (Monday)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

export const [AppSettingsProvider, useAppSettings] = createContextHook(() => {
  const queryClient = useQueryClient();

  // Clear all settings for fresh start
  const clearAllSettings = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
      queryClient.invalidateQueries({ queryKey: ['app_settings'] });
      console.log('All settings cleared successfully');
    } catch (error) {
      console.error('Error clearing settings:', error);
    }
  }, [queryClient]);

  const settingsQuery = useQuery({
    queryKey: ['app_settings'],
    queryFn: async (): Promise<AppSettings> => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
        return DEFAULT_SETTINGS;
      } catch (error) {
        console.error('Error loading app settings:', error);
        return DEFAULT_SETTINGS;
      }
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: AppSettings) => {
      if (!settings || typeof settings !== 'object') return settings;
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app_settings'] });
    }
  });

  const { mutateAsync: saveSettings } = saveSettingsMutation;

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const currentSettings = settingsQuery.data || DEFAULT_SETTINGS;
    const updatedSettings = { ...currentSettings, ...updates };
    await saveSettings(updatedSettings);
    // Force re-render by invalidating queries
    queryClient.invalidateQueries({ queryKey: ['app_settings'] });
  }, [settingsQuery.data, saveSettings, queryClient]);

  const incrementDailyUsage = useCallback(async () => {
    const currentSettings = settingsQuery.data || DEFAULT_SETTINGS;
    const today = new Date().toDateString();
    const currentWeek = getWeekStart(new Date()).toDateString();
    
    let dailyStoriesUsed = currentSettings.dailyStoriesUsed;
    let weeklyStoriesUsed = currentSettings.weeklyStoriesUsed || 0;
    let currentStreak = currentSettings.currentStreak;
    let lastWeeklyReset = currentSettings.lastWeeklyReset || today;
    
    // Reset daily usage if new day
    if (currentSettings.lastUsageDate !== today) {
      dailyStoriesUsed = 0;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (currentSettings.lastUsageDate === yesterday) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    }
    
    // Reset weekly usage if new week
    if (getWeekStart(new Date(lastWeeklyReset)).toDateString() !== currentWeek) {
      weeklyStoriesUsed = 0;
      lastWeeklyReset = currentWeek;
    }
    
    dailyStoriesUsed += 1;
    weeklyStoriesUsed += 1;
    const longestStreak = Math.max(currentSettings.longestStreak, currentStreak);
    
    await updateSettings({
      dailyStoriesUsed,
      weeklyStoriesUsed,
      lastUsageDate: today,
      lastWeeklyReset,
      currentStreak,
      longestStreak,
    });
  }, [settingsQuery.data, updateSettings]);

  const addProfile = useCallback(async (profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const currentSettings = settingsQuery.data || DEFAULT_SETTINGS;
    const newProfile: UserProfile = {
      ...profile,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedProfiles = [...currentSettings.profiles, newProfile];
    await updateSettings({ 
      profiles: updatedProfiles,
      selectedProfileId: newProfile.id 
    });
    
    return newProfile;
  }, [settingsQuery.data, updateSettings]);

  const selectProfile = useCallback(async (profileId: string) => {
    await updateSettings({ selectedProfileId: profileId });
  }, [updateSettings]);

  const deleteProfile = useCallback(async (profileId: string) => {
    const currentSettings = settingsQuery.data || DEFAULT_SETTINGS;
    const updatedProfiles = currentSettings.profiles.filter(p => p.id !== profileId);
    const selectedProfileId = currentSettings.selectedProfileId === profileId 
      ? updatedProfiles[0]?.id 
      : currentSettings.selectedProfileId;
    
    await updateSettings({ 
      profiles: updatedProfiles,
      selectedProfileId 
    });
  }, [settingsQuery.data, updateSettings]);

  const upgradeToPremium = useCallback(async () => {
    await updateSettings({ isPremium: true });
  }, [updateSettings]);

  const canCreateStory = useMemo(() => {
    const settings = settingsQuery.data || DEFAULT_SETTINGS;
    const limits = getUsageLimits(settings.isPremium);
    const today = new Date().toDateString();
    const currentWeek = getWeekStart(new Date()).toDateString();
    
    // Reset weekly usage if new week
    const lastWeeklyReset = settings.lastWeeklyReset || today;
    const weeklyUsage = getWeekStart(new Date(lastWeeklyReset)).toDateString() === currentWeek 
      ? (settings.weeklyStoriesUsed || 0) 
      : 0;
    
    return weeklyUsage < limits.weeklyStories;
  }, [settingsQuery.data]);

  const selectedProfile = useMemo(() => {
    const settings = settingsQuery.data || DEFAULT_SETTINGS;
    return settings.profiles.find(p => p.id === settings.selectedProfileId);
  }, [settingsQuery.data]);

  const currentLanguage = useMemo(() => {
    return (settingsQuery.data?.language as SupportedLanguage) || 'en';
  }, [settingsQuery.data?.language]);

  const lastSelectedGender = useMemo(() => {
    return (settingsQuery.data?.lastSelectedGender as 'boy' | 'girl') || 'boy';
  }, [settingsQuery.data?.lastSelectedGender]);

  const t = useTranslation(currentLanguage).t;

  return useMemo(() => ({
    settings: settingsQuery.data || DEFAULT_SETTINGS,
    isLoading: settingsQuery.isLoading,
    usageLimits: getUsageLimits((settingsQuery.data || DEFAULT_SETTINGS).isPremium),
    canCreateStory,
    selectedProfile,
    currentLanguage,
    lastSelectedGender,
    t,
    updateSettings,
    incrementDailyUsage,
    addProfile,
    selectProfile,
    deleteProfile,
    upgradeToPremium,
    clearAllSettings
  }), [
    settingsQuery.data, 
    settingsQuery.isLoading, 
    canCreateStory, 
    selectedProfile,
    currentLanguage,
    lastSelectedGender,
    t,
    updateSettings,
    incrementDailyUsage,
    addProfile,
    selectProfile,
    deleteProfile,
    upgradeToPremium,
    clearAllSettings
  ]);
});