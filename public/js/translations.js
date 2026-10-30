/**
 * FARM PRO - Multilingual Translation Engine (English & हिन्दी)
 * Powered by Lavkush
 */

const TRANSLATIONS = {
  en: {
    // Top Bar & Network
    announcement_text: "🌾 Welcome to Farm Pro Web Portal! AI Plant Scanner and Full Voice Assistant now online.",
    worldwide_label: "Worldwide:",
    copy_worldwide_btn: "Copy Global Link",
    user_link_label: "User Link:",
    copy_user_btn: "Copy lav-medication",
    wifi_label: "Wi-Fi:",
    copy_wifi_btn: "Copy Wi-Fi",
    voice_label: "Voice:",
    voice_ready: "Ready",
    voice_speaking: "Speaking...",

    // Navigation
    nav_home: "Home",
    nav_scanner: "AI Scanner",
    nav_requests: "Requests",
    nav_diseases: "Plant Doctor",
    nav_fertilizers: "Fertilizers",
    nav_chatl: "ChatL AI",
    nav_launcher: "App Launcher",
    user_mode_btn: "User Mode",
    admin_mode_btn: "Admin Mode",
    change_pass_btn: "Change Password",

    // Role Strip
    user_role_msg: "<strong>User Mode Active:</strong> You can browse all crops, perform live AI plant scans, chat with ChatL AI, and submit diagnosis requests.",
    admin_role_msg: "<strong>👑 Admin Mode:</strong> Full rights active. Default password: <strong style='color:var(--amber-gold)'>admin123</strong>. You can edit/delete diseases, prescribe solutions to requests, and configure settings.",
    switch_to_admin: "Switch to Admin",
    exit_admin: "Exit Admin",
    settings_btn: "Settings",

    // Hero Section
    hero_pill: "NEXT-GEN SMART AGRICULTURE ECOSYSTEM",
    hero_title_prefix: "Farm Pro AI Assistant",
    hero_title_suffix: "Powered by Lavkush",
    hero_desc: "Instant leaf disease detection, scientific fertilizer calculation, intelligent ChatL AI, and dual Admin-User farm management. Connect directly to the FarmCare Pro desktop app or run online diagnostics from any phone or PC.",
    hero_btn_scan: "Scan Leaf Now",
    hero_btn_chatl: "Open ChatL AI",
    hero_btn_admin: "Admin Hub",
    stat_farmers: "Active Farmers",
    stat_models: "Disease Models",
    stat_precision: "AI Precision",
    stat_modes: "Bilingual (Eng / हिंदी)",

    // AI Scanner Section
    scanner_badge: "SMART DISEASE DETECTOR",
    scanner_title: "AI Leaf Disease Scanner",
    scanner_subtitle: "Upload a photo of your affected crop leaf, use Live Camera, or pick a sample below. Our neural vision engine diagnoses fungal, bacterial, and pest attacks in seconds.",
    scanner_panel_title: "Upload or Live Camera Scan",
    scanner_camera_btn: "Live Camera",
    scanner_camera_stop: "Stop Camera",
    drop_title: "Click to upload, drag & drop, or click Live Camera",
    drop_hint: "Supports JPG, PNG, WEBP from Phone or PC",
    camera_target_leaf: "TARGET AFFECTED LEAF",
    camera_cancel: "Cancel Camera",
    camera_snap: "Snap Photo & Diagnose",
    scanner_sample_label: "Or test with ready crop samples:",
    sample_tomato: "🍅 Tomato Early Blight",
    sample_powdery: "🌿 Powdery Mildew",
    sample_aphids: "🐛 Pest Aphids",
    sample_healthy: "✨ Healthy Leaf (98%)",
    crop_name_label: "Crop Name",
    symptoms_label: "Observed Symptoms (Type or Speak)",
    symptoms_placeholder: "e.g. brown concentric spots, yellow edges",
    btn_run_scan: "Run AI Diagnosis",

    // Scanner Results
    diag_panel_title: "Diagnosis Assessment",
    diag_status_ready: "Ready to Scan",
    diag_status_scanning: "Scanning Leaf...",
    diag_status_complete: "Analysis Complete",
    no_scan_title: "No Scan Run Yet",
    no_scan_desc: "Upload a leaf image, use <strong>Live Camera</strong>, or pick a sample crop, then click <strong>\"Run AI Diagnosis\"</strong>.",
    detected_issue: "Detected Issue:",
    confidence_label: "Confidence",
    severity_label: "Severity Level",
    chlorophyll_label: "Chlorophyll Index",
    moisture_label: "Moisture Est.",
    root_cause_label: "Root Cause",
    organic_cure_label: "🌱 100% Organic Remedy & Plant Health Suggestions",
    organic_subtitle: "Natural, chemical-free herbal preparations, soil enrichment, and plant care routine.",
    btn_ask_chatl_organic: "Ask ChatL for Step-by-Step Organic Recipe",
    organic_badge_text: "100% Natural / Organic",
    crop_organic_hint_title: "🌱 Live Organic Suggestion for Selected Crop:",
    organic_badge_pill: "100% Organic",
    analysis_live_tip_title: "🌱 Live Organic Plant Suggestion While Analyzing:",
    prompt_chip_jeevamrut: "🌿 Make Jeevamrutha",
    prompt_chip_powdery: "🥛 Buttermilk Spray",
    prompt_chip_pest: "🐛 Organic Pest Agniastra",
    prompt_chip_tricho: "🔬 Trichoderma Bio-Fungicide",
    prompt_chip_npk: "🧪 Organic NPK Alternatives",
    cure_label: "Prescribed Chemical Treatment (Standard)",
    prev_label: "Long-Term Prevention",
    btn_listen_diag: "Listen to Diagnosis & Cures",
    btn_escalate_admin: "Escalate to Admin",
    btn_print_diag: "Print Diagnosis",

    // Requests Section
    req_badge: "CONSULTATION & INQUIRIES",
    req_title: "Farm Pro Requests & Inquiries",
    req_subtitle: "Users can submit diagnosis tickets and questions. Admins have rights to review, diagnose, update status, and prescribe cures.",
    btn_submit_request: "Submit New Request",
    btn_refresh: "Refresh",
    filter_all: "All Requests",
    filter_pending: "Pending",
    filter_inreview: "In Review",
    filter_resolved: "Resolved",
    search_req_placeholder: "Search by farmer, crop, symptoms...",

    // Plant Doctor Section
    plants_badge: "KNOWLEDGE BASE & REMEDIES",
    plants_title: "Plant Doctor & Disease Guide",
    plants_subtitle: "Comprehensive disease treatments, dosage guides, and symptoms verified by specialist agronomists.",
    tab_diseases: "Crop Diseases",
    tab_fertilizers: "Fertilizer Schedule",
    tab_watering: "Watering Guide",
    tab_tips: "Farming Tips",
    btn_add_disease: "Add New Disease",
    btn_speak_cure: "Speak Cure",
    btn_edit: "Edit",
    btn_delete: "Delete",
    label_symptoms: "Key Symptoms:",
    label_cure: "Recommended Cure:",

    // ChatL AI Section
    chatl_badge: "AI AGRI ADVISOR",
    chatl_title: "ChatL AI - Powered by Lavkush",
    chatl_subtitle: "Ask any question regarding crop diseases, soil nutrients, pesticides, or launch instructions.",
    tab_persona_chatl: "ChatL Agri",
    tab_persona_chatvlsi: "ChatVLSI 1.2",
    auto_voice_label: "Auto-Voice:",
    prompt_chip_1: "Treat Leaf Blight",
    prompt_chip_2: "Tomato Fertilizer",
    prompt_chip_3: "Run Batch File",
    prompt_chip_4: "ChatVLSI Verilog",
    chatl_input_placeholder: "Type or click mic to speak query (e.g. Tomato blight, Urea timing, Verilog)...",
    btn_send_chat: "Send",
    chatl_welcome: "Namaste! 🌿 I am **ChatL AI**, powered by Lavkush for Farm Pro. How can I help your farm or crops today? You can ask about plant diseases, remedies, fertilizer NPK dosages, or switch above to **ChatVLSI 1.2** for hardware and RTL timing!",

    // Launcher Section
    launcher_badge: "NATIVE APPLICATION CONTROL",
    launcher_title: "FarmCare Pro App Launcher",
    launcher_subtitle: "Direct launcher integration for G:\\app_developer_sonu\\farming_app power by lavkush\\install_and_run.bat",
    launcher_path_label: "Application Path:",
    launcher_bat_label: "Batch Script:",
    btn_launch_app: "Launch Farm Pro Now",
    btn_stop_app: "Stop App",
    btn_clear_logs: "Clear Output",

    // Modals
    modal_admin_auth_title: "Admin Mode Access",
    modal_admin_pass_label: "Enter Admin Password:",
    modal_admin_pass_hint: "Default password: <strong>admin123</strong>. Powered by Lavkush.",
    btn_unlock_admin: "Unlock Admin Mode",
    btn_send_otp: "Send OTP to Mobile",
    btn_verify_otp: "Verify OTP & Continue",
    modal_change_pass_title: "Change Admin Security Password",
    label_current_pass: "Current Admin Password:",
    label_new_pass: "New Admin Password:",
    label_confirm_pass: "Confirm New Password:",
    label_backup_mobile: "Registered Mobile Number (for OTP backup):",
    btn_save_password: "Save New Password",
    btn_cancel: "Cancel",

    // Footer
    footer_desc: "Next-generation Smart Agriculture Platform. AI vision leaf diagnosis, intelligent crop management, and native app integration.",
    footer_rights: "All Rights Reserved. Farm Pro ecosystem powered by"
  },

  hi: {
    // Top Bar & Network
    announcement_text: "🌾 फार्म प्रो वेब पोर्टल में आपका स्वागत है! एआई पत्ती स्कैनर एवं वॉयस सहायक अब ऑनलाइन उपलब्ध हैं।",
    worldwide_label: "वैश्विक लिंक:",
    copy_worldwide_btn: "वैश्विक लिंक कॉपी करें",
    user_link_label: "यूज़र लिंक:",
    copy_user_btn: "lav-medication कॉपी करें",
    wifi_label: "वाई-फ़ाई:",
    copy_wifi_btn: "वाई-फ़ाई लिंक कॉपी करें",
    voice_label: "वॉइस:",
    voice_ready: "तैयार",
    voice_speaking: "बोल रहा है...",

    // Navigation
    nav_home: "होम",
    nav_scanner: "एआई स्कैनर",
    nav_requests: "परामर्श अनुरोध",
    nav_diseases: "पादप चिकित्सक",
    nav_fertilizers: "उर्वरक गाइड",
    nav_chatl: "चैटएल एआई",
    nav_launcher: "ऐप लॉन्चर",
    user_mode_btn: "यूज़र मोड",
    admin_mode_btn: "एडमिन मोड",
    change_pass_btn: "पासवर्ड बदलें",

    // Role Strip
    user_role_msg: "<strong>यूज़र मोड सक्रिय:</strong> आप सभी फसलें देख सकते हैं, एआई पत्ती स्कैन कर सकते हैं, चैटएल से पूछ सकते हैं और परामर्श अनुरोध भेज सकते हैं।",
    admin_role_msg: "<strong>👑 एडमिन मोड:</strong> पूर्ण प्रबंधन अधिकार सक्रिय। डिफ़ॉल्ट पासवर्ड: <strong style='color:var(--amber-gold)'>admin123</strong>। आप फसलों के रोग, उपचार और अनुरोध संपादित कर सकते हैं।",
    switch_to_admin: "एडमिन में बदलें",
    exit_admin: "एडमिन से बाहर आएं",
    settings_btn: "सेटिंग्स",

    // Hero Section
    hero_pill: "स्मार्ट कृषि एवं डिजिटल फसल सुरक्षा तंत्र",
    hero_title_prefix: "फार्म प्रो एआई सहायक",
    hero_title_suffix: "लवकुश द्वारा संचालित",
    hero_desc: "पत्तियों के रोगों की तुरंत पहचान, वैज्ञानिक उर्वरक खुराक, बुद्धिमान चैटएल एआई और दोहरी एडमिन-यूज़र प्रबंधन प्रणाली। मोबाइल या कंप्यूटर से सीधे निदान करें।",
    hero_btn_scan: "पत्ती स्कैन करें",
    hero_btn_chatl: "चैटएल एआई खोलें",
    hero_btn_admin: "एडमिन हब",
    stat_farmers: "सक्रिय किसान",
    stat_models: "रोग निदान मॉडल",
    stat_precision: "एआई सटीकता",
    stat_modes: "द्विभाषी (Eng / हिन्दी)",

    // AI Scanner Section
    scanner_badge: "स्मार्ट रोग डिटेक्टर",
    scanner_title: "एआई फसल पत्ती रोग स्कैनर",
    scanner_subtitle: "प्रभावित फसल की पत्ती की फोटो अपलोड करें, लाइव कैमरे का उपयोग करें या नीचे से नमूना चुनें। हमारा न्यूरल विज़न इंजन कुछ ही सेकंड में रोग पहचान लेता है।",
    scanner_panel_title: "फोटो अपलोड या लाइव कैमरा स्कैन",
    scanner_camera_btn: "लाइव कैमरा",
    scanner_camera_stop: "कैमरा बंद करें",
    drop_title: "अपलोड करने के लिए क्लिक करें, फ़ाइल खींचें या लाइव कैमरा खोलें",
    drop_hint: "मोबाइल या कंप्यूटर से JPG, PNG, WEBP समर्थित",
    camera_target_leaf: "प्रभावित पत्ती पर कैमरा केंद्रित करें",
    camera_cancel: "कैमरा रद्द करें",
    camera_snap: "फोटो खींचें और जांचें",
    scanner_sample_label: "या तैयार फसल नमूनों से जांच करें:",
    sample_tomato: "🍅 टमाटर अगेती झुलसा",
    sample_powdery: "🌿 चूर्णिल आसिता (पाउडरी)",
    sample_aphids: "🐛 माहू / एफिड कीट",
    sample_healthy: "✨ स्वस्थ पत्ती (98%)",
    crop_name_label: "फसल का नाम",
    symptoms_label: "लक्षण बताएं (टाइप करें या बोलें)",
    symptoms_placeholder: "जैसे भूरे गोल धब्बे, पत्तियों का पीला पड़ना",
    btn_run_scan: "एआई रोग निदान शुरू करें",

    // Scanner Results
    diag_panel_title: "निदान एवं स्वास्थ्य रिपोर्ट",
    diag_status_ready: "जांच के लिए तैयार",
    diag_status_scanning: "पत्ती स्कैन हो रही है...",
    diag_status_complete: "विश्लेषण पूर्ण",
    no_scan_title: "अभी कोई जांच नहीं हुई",
    no_scan_desc: "पत्ती की फोटो अपलोड करें, <strong>लाइव कैमरा</strong> चलाएं या नमूना चुनें, फिर <strong>\"एआई रोग निदान शुरू करें\"</strong> पर क्लिक करें।",
    detected_issue: "पहचाना गया रोग:",
    confidence_label: "सटीकता",
    severity_label: "गंभीरता स्तर",
    chlorophyll_label: "क्लोरोफिल सूचकांक",
    moisture_label: "अनुमानित नमी",
    root_cause_label: "मूल कारण",
    organic_cure_label: "🌱 100% जैविक व प्राकृतिक उपचार और पादप सलाह",
    organic_subtitle: "रसायन-मुक्त प्राकृतिक जड़ी-बूटी घोल, मिट्टी संवर्धन एवं पादप सुरक्षा।",
    btn_ask_chatl_organic: "चैटएल से जैविक विधि पूछें",
    organic_badge_text: "100% प्राकृतिक / जैविक",
    crop_organic_hint_title: "🌱 चयनित फसल के लिए तुरंत जैविक परामर्श:",
    organic_badge_pill: "100% जैविक",
    analysis_live_tip_title: "🌱 विश्लेषण के दौरान लाइव जैविक परामर्श:",
    prompt_chip_jeevamrut: "🌿 जीवामृत विधि",
    prompt_chip_powdery: "🥛 खट्टी छाछ स्प्रे",
    prompt_chip_pest: "🐛 जैविक कीट नियंत्रक अग्न्यास्त्र",
    prompt_chip_tricho: "🔬 ट्राइकोडर्मा बायो-फंगीसाइड",
    prompt_chip_npk: "🧪 यूरिया/डीएपी के जैविक विकल्प",
    cure_label: "सुझाया गया रासायनिक उपचार (मानक)",
    prev_label: "दीर्घकालिक रोकथाम",
    btn_listen_diag: "निदान व उपचार सुनें",
    btn_escalate_admin: "एडमिन को भेजें",
    btn_print_diag: "निदान प्रिंट करें",

    // Requests Section
    req_badge: "परामर्श एवं किसान अनुरोध",
    req_title: "फार्म प्रो परामर्श व सहायता टिकट",
    req_subtitle: "किसान भाई अपनी फसल की समस्या और फोटो भेज सकते हैं। एडमिन के पास जांचने और व्यक्तिगत नुस्खा लिखने के पूरे अधिकार हैं।",
    btn_submit_request: "नया परामर्श अनुरोध भेजें",
    btn_refresh: "ताज़ा करें",
    filter_all: "सभी अनुरोध",
    filter_pending: "लंबित",
    filter_inreview: "समीक्षाधीन",
    filter_resolved: "हल किए गए",
    search_req_placeholder: "किसान का नाम, फसल या लक्षण खोजें...",

    // Plant Doctor Section
    plants_badge: "रोग ज्ञानकोष एवं उपचार",
    plants_title: "पादप चिकित्सक एवं रोग गाइड",
    plants_subtitle: "कृषि विशेषज्ञों द्वारा प्रमाणित फसलों के प्रमुख रोग, रासायनिक व जैविक उपचार और सावधानियां।",
    tab_diseases: "फसल रोग",
    tab_fertilizers: "उर्वरक चार्ट",
    tab_watering: "सिंचाई कार्यक्रम",
    tab_tips: "कृषि सुझाव",
    btn_add_disease: "नया रोग जोड़ें",
    btn_speak_cure: "उपचार सुनें",
    btn_edit: "संपादित करें",
    btn_delete: "हटाएं",
    label_symptoms: "मुख्य लक्षण:",
    label_cure: "अनुशंसित उपचार:",

    // ChatL AI Section
    chatl_badge: "एआई कृषि सलाहकार",
    chatl_title: "चैटएल एआई - लवकुश द्वारा संचालित",
    chatl_subtitle: "फसल रोगों, कीटनाशकों, खाद की मात्रा (NPK) या ऐप के बारे में कोई भी प्रश्न पूछें।",
    tab_persona_chatl: "चैटएल कृषि",
    tab_persona_chatvlsi: "चैटवीएलएसआई 1.2",
    auto_voice_label: "ऑटो-वॉइस:",
    prompt_chip_1: "झुलसा रोग का उपचार",
    prompt_chip_2: "टमाटर हेतु खाद",
    prompt_chip_3: "बैच फ़ाइल कैसे चलाएं",
    prompt_chip_4: "चैटवीएलएसआई वेरिलॉग",
    chatl_input_placeholder: "प्रश्न लिखें या माइक दबाकर बोलें (जैसे टमाटर रोग, यूरिया कब डालें, वेरिलॉग)...",
    btn_send_chat: "भेजें",
    chatl_welcome: "नमस्ते! 🌿 मैं **चैटएल एआई** हूँ, फार्म प्रो के लिए लवकुश द्वारा संचालित। आज मैं आपकी फसलों की क्या सहायता कर सकता हूँ? आप फसलों के रोग, दवाइयां, खाद (NPK) की मात्रा पूछ सकते हैं या ऊपर **चैटवीएलएसआई 1.2** पर स्विच कर हार्डवेयर और वीएलएसआई संबंधित प्रश्न पूछ सकते हैं!",

    // Launcher Section
    launcher_badge: "डेस्कटॉप ऐप एकीकरण",
    launcher_title: "फार्मकेयर प्रो ऐप लॉन्चर",
    launcher_subtitle: "G:\\app_developer_sonu\\farming_app power by lavkush\\install_and_run.bat का सीधा संचालन",
    launcher_path_label: "एप्लिकेशन पथ:",
    launcher_bat_label: "बैच स्क्रिप्ट स्थिति:",
    btn_launch_app: "फार्म प्रो अभी चलाएं",
    btn_stop_app: "ऐप बंद करें",
    btn_clear_logs: "लॉग साफ करें",

    // Modals
    modal_admin_auth_title: "एडमिन सुरक्षा प्रमाणीकरण",
    modal_admin_pass_label: "एडमिन पासवर्ड दर्ज करें:",
    modal_admin_pass_hint: "डिफ़ॉल्ट पासवर्ड: <strong>admin123</strong>। लवकुश द्वारा सुरक्षित।",
    btn_unlock_admin: "एडमिन मोड अनलॉक करें",
    btn_send_otp: "मोबाइल पर ओटीपी भेजें",
    btn_verify_otp: "ओटीपी सत्यापित कर जारी रखें",
    modal_change_pass_title: "एडमिन सुरक्षा पासवर्ड बदलें",
    label_current_pass: "वर्तमान एडमिन पासवर्ड:",
    label_new_pass: "नया पासवर्ड बनाएं:",
    label_confirm_pass: "नए पासवर्ड की पुष्टि करें:",
    label_backup_mobile: "पंजीकृत मोबाइल नंबर (ओटीपी सुरक्षा हेतु):",
    btn_save_password: "नया पासवर्ड सुरक्षित करें",
    btn_cancel: "रद्द करें",

    // Footer
    footer_desc: "अगली पीढ़ी का स्मार्ट कृषि मंच। एआई पत्ती रोग पहचान, वैज्ञानिक फसल प्रबंधन और आधुनिक किसान सहायता प्रणाली।",
    footer_rights: "सर्वाधिकार सुरक्षित। फार्म प्रो इकोसिस्टम संचालित द्वारा"
  }
};

// Hindi translations for Scanner Samples
const SCAN_SAMPLES_HI = {
  tomato: {
    crop: 'टमाटर',
    symptoms: 'निचली पत्तियों पर पीले घेरे के साथ गोल भूरे धब्बे',
    diseaseName: 'टमाटर अगेती झुलसा (Early Blight - Alternaria solani)',
    severity: 'उच्च',
    confidence: '97.4%',
    chlorophyll: '78.2 SPAD',
    moisture: '64%',
    causes: 'फफूंद रोगजनक (अल्टर्नेरिया सोलानी)। गर्म एवं नम मौसम में बारिश के छींटों से तेजी से फैलता है।',
    cure: [
      'संक्रमित निचली पत्तियों को तुरंत तोड़कर खेत से दूर दबा दें।',
      'मैन्कोजेब 75% WP @ 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।',
      '7 दिन बाद कॉपर ऑक्सीक्लोराइड 50% WP @ 3 ग्राम/लीटर का दूसरा छिड़काव करें।',
      'पौधों के आधार पर पुआल की मल्चिंग करें ताकि मिट्टी के छींटे पत्तियों पर न पड़ें।'
    ],
    organicRemedies: [
      'खट्टी छाछ (मट्ठा) का घोल: 50 मिली पुरानी खट्टी छाछ (तांबे के बर्तन में 4 दिन रखी हुई) को 1 लीटर पानी में मिलाकर हर 5-7 दिन में पत्तियों पर छिड़कें। लैक्टिक एसिड झुलसा फफूंद को नष्ट करता है।',
      'कोल्ड-प्रेस्ड नीम का तेल: 5 मिली नीम तेल + 2 मिली हर्बल साबुन प्रति लीटर पानी में मिलाकर शाम के समय छिड़कें।',
      'ट्राइकोडर्मा हार्वियानम (5 ग्राम प्रति लीटर) से जड़ों के पास मिट्टी को नम करें।',
      'जैविक पोषण: पौधे के चारों ओर 250 ग्राम वर्मीकम्पोस्ट (केंचुआ खाद) + 50 ग्राम नीम की खली डालें।'
    ],
    plantCareSuggestions: [
      'निचली 6 इंच की संक्रमित पत्तियों को काट दें ताकि मिट्टी के छींटे न लगें।',
      'केवल सुबह के समय पौधों की जड़ों में पानी दें; पत्तियों को गीला न रखें।',
      'क्यारियों में सूखी पुआल की मल्चिंग करें जिससे नमी बनी रहे।'
    ],
    prevention: [
      'हर 2 मौसम में गैर-सोलनेसी फसलों (मक्का, दलहन) के साथ फसल चक्र अपनाएं।',
      'हवा के संचलन के लिए पौधों के बीच 60 सेमी की दूरी रखें।',
      'ऊपर से छिड़काव के बजाय ड्रिप सिंचाई पद्धति का प्रयोग करें।'
    ],
    img: 'images/sample_tomato_blight.jpg'
  },
  powdery: {
    crop: 'बेलवर्गीय / कद्दूवर्गीय',
    symptoms: 'पत्तियों की ऊपरी सतह पर सफेद चूर्ण जैसे धब्बे, किनारों का मुड़ना',
    diseaseName: 'चूर्णिल आसिता / पाउडरी मिल्ड्यू (Erysiphe cichoracearum)',
    severity: 'मध्यम',
    confidence: '95.8%',
    chlorophyll: '82.5 SPAD',
    moisture: '58%',
    causes: 'सूखे और गर्म दिन तथा रात में अधिक नमी के दौरान फफूंद बीजाणुओं का अंकुरण।',
    cure: [
      'नीम का तेल (5 मिली/लीटर) हल्के साबुन के साथ मिलाकर हर 5 दिन में छिड़कें।',
      'घुलनशील गंधक (Wettable Sulphur 80% WP) @ 2 ग्राम प्रति लीटर पानी का छिड़काव करें।',
      'अधिक ग्रसित पत्तियों को काटकर नष्ट करें।'
    ],
    organicRemedies: [
      'मीठा सोडा (बेकिंग सोडा) व नीम तेल घोल: 5 ग्राम बेकिंग सोडा + 5 मिली नीम तेल प्रति लीटर पानी में मिलाकर पत्तियों पर छिड़कें।',
      'कच्चे दूध का प्राकृतिक स्प्रे: 1 भाग कच्चा गाय का दूध + 9 भाग पानी मिलाकर धूप में छिड़कें; इसके एंजाइम फफूंद को समाप्त करते हैं।',
      'सुबह ओस के समय छानी हुई लकड़ी की राख का पत्तियों पर हल्का भुरकाव करें।',
      'पंचगव्य (30 मिली प्रति लीटर) का छिड़काव करके रोग प्रतिरोधक क्षमता बढ़ाएं।'
    ],
    plantCareSuggestions: [
      'पौधे को 6-8 घंटे की सीधी धूप सुनिश्चित करें।',
      'अत्यधिक नाइट्रोजन खाद से बचें जो कोमल अतिसंवेदनशील पत्तियों को बढ़ाती है।',
      'घनी शाखाओं की छंटाई करें ताकि हवा का संचार बना रहे।'
    ],
    prevention: [
      'पौधों को सुबह की सीधी धूप सुनिश्चित करें।',
      'अत्यधिक नाइट्रोजन खाद से बचें जो कोमल अतिसंवेदनशील पत्तियों को बढ़ाती है।',
      'जड़ों पर पानी दें, पत्तियों पर नहीं'
    ],
    img: 'images/sample_powdery_mildew.jpg'
  },
  aphids: {
    crop: 'कपास / मिर्च / सब्जियां',
    symptoms: 'पत्तियों के किनारों का मुड़ना, चिपचिपा तरल, कोमल शाखाओं का रुकना',
    diseaseName: 'माहू / एफिड कीट प्रकोप (Aphis gossypii)',
    severity: 'मध्यम',
    confidence: '94.2%',
    chlorophyll: '74.0 SPAD',
    moisture: '70%',
    causes: 'रस चूसक कीटों का समूह जो पत्तियों का रस चूसता है और विषाणु फैलाता है।',
    cure: [
      'इमिडाक्लोप्रिड 17.8% SL @ 0.5 मिली प्रति लीटर पानी का छिड़काव करें।',
      'जैविक: 5% नीम बीज अर्क (NSKE) या दशपर्णी अर्क का प्रयोग करें।',
      'पानी की तेज धार से पत्तियों के निचले हिस्से को धोएं।'
    ],
    organicRemedies: [
      'नीमस्त्र (Neemastra): 5 किग्रा नीम पत्ती + 5 लीटर गोमूत्र + 2 किग्रा गोबर 100L पानी में 48 घंटे सड़ाकर बिना मिलाए छिड़कें।',
      'लहसुन-मिर्च तीखा अर्क: 50 ग्राम लहसुन व 50 ग्राम तीखी मिर्च पीसकर उबालें, 1:10 अनुपात में पानी में मिलाकर शाम को पत्तियों के नीचे छिड़कें।',
      'दशपर्णी अर्क @ 20 मिली प्रति लीटर पानी में मिलाकर शाम के समय छिड़कें।',
      'पीले चिपचिपे कार्ड (Yellow Sticky Traps) प्रति एकड़ 10 लगाएं।'
    ],
    plantCareSuggestions: [
      'क्यारियों के किनारे गेंदे के पौधे (Marigold) लगाएं जो कीटों को अपनी ओर खींचते हैं।',
      'लेडीबर्ड भृंग (मित्र कीट) का संरक्षण करें जो प्रतिदिन 50 माहू खाता है।',
      'पानी की तेज धार से पत्तियों की निचली सतह को धोएं।'
    ],
    prevention: [
      'खेत में प्रति एकड़ 10 पीले चिपचिपे ट्रैप (Yellow Sticky Traps) लगाएं।',
      'लेडीबर्ड भृंग (Ladybird Beetle) जैसे मित्र कीटों का संरक्षण करें।'
    ],
    img: 'images/sample_aphids_pest.jpg'
  },
  healthy: {
    crop: 'गेहूं / अनाज',
    symptoms: 'गहरा हरा छत्रक, मजबूत जड़ें, पत्तियों पर कोई दाग नहीं',
    diseaseName: 'स्वस्थ फसल (कोई रोग नहीं मिला)',
    severity: 'सामान्य',
    confidence: '98.9%',
    chlorophyll: '96.4 SPAD',
    moisture: '72%',
    causes: 'संतुलित पोषण एवं समय पर उचित जल प्रबंधन।',
    cure: [
      'किसी रासायनिक उपचार की आवश्यकता नहीं है।',
      'क्राउन रूट (CRI) अवस्था पर निर्धारित सिंचाई जारी रखें।',
      'संतुलित NPK की अनुशंसित शीर्ष खुराक जारी रखें।'
    ],
    organicRemedies: [
      'तरल जीवामृत (10% घोल) का हर 15 दिन में पत्तियों पर छिड़काव करें या सिंचाई के साथ 200 लीटर प्रति एकड़ बहाएं।',
      'पंचगव्य (30 मिली/लीटर) का छिड़काव करें जो पत्तियों में क्लोरोफिल और फसल चमक को बढ़ाता है।',
      'सूखी पुआल से क्यारियों को ढकें (मल्चिंग) जिससे केंचुए और मित्र जीवाणु सक्रिय रहें।'
    ],
    plantCareSuggestions: [
      'नियमित रूप से मिट्टी में नमी की जांच करें और जलभराव न होने दें।',
      'फसल चक्र में दलहनी फसलों को शामिल करें जो प्राकृतिक नाइट्रोजन संचित करती हैं।'
    ],
    prevention: [
      'कीटों के शुरुआती प्रकोप के लिए नियमित साप्ताहिक निगरानी रखें।'
    ],
    img: 'images/sample_healthy_leaf.jpg'
  }
};

// Hindi translations for Plant Doctor Diseases
const DISEASES_HI = {
  leaf_blight: {
    name: 'पत्ती झुलसा रोग (Leaf Blight)',
    severity: 'उच्च',
    causes: 'फफूंद संक्रमण (अल्टरनेरिया, हेल्मिन्थोस्पोरियम)',
    symptoms: [
      'पत्तियों पर गोल भूरे या बादामी धब्बे',
      'पत्तियों के किनारों का पीला पड़ना व मुरझाना',
      'आर्द्र व नम मौसम में तीव्र फैलाव'
    ],
    cure: [
      'संक्रमित पत्तियों को तुरंत हटाकर नष्ट करें',
      'कॉपर युक्त फफूंदनाशक (2 ग्राम प्रति लीटर पानी) का छिड़काव करें',
      'मैन्कोजेब 75% WP @ 2.5 ग्राम प्रति लीटर छिड़कें',
      'पौधों के बीच हवा का आवागमन सुधारें'
    ],
    prevention: [
      'रोग प्रतिरोधी बीजों का उपयोग करें',
      'फसल चक्र अपनाएं',
      'उचित दूरी पर बुवाई करें'
    ]
  },
  powdery_mildew: {
    name: 'चूर्णिल आसिता (Powdery Mildew)',
    severity: 'मध्यम',
    causes: 'फफूंद संक्रमण (एरीसाइफी, पोडोस्फेरा)',
    symptoms: [
      'पत्तियों पर सफेद पाउडर की परत',
      'पत्तियों का मुड़ना और विकृत होना',
      'नई शाखाओं की बढ़वार रुकना'
    ],
    cure: [
      'नीम तेल का घोल (5 मिली प्रति लीटर पानी) छिड़कें',
      'घुलनशील गंधक फफूंदनाशक का प्रयोग करें',
      'बेकिंग सोडा का घोल (1 चम्मच प्रति 4 लीटर पानी) छिड़कें',
      'कराथेन 0.05% का छिड़काव करें'
    ],
    prevention: [
      'पर्याप्त धूप सुनिश्चित करें',
      'अत्यधिक नाइट्रोजन युक्त खाद से बचें',
      'जड़ों पर पानी दें, पत्तियों पर नहीं'
    ]
  },
  root_rot: {
    name: 'जड़ गलन रोग (Root Rot)',
    severity: 'गंभीर',
    causes: 'अत्यधिक जलभराव एवं जल निकासी की कमी (पिथियम, फाइटोफ्थोरा)',
    symptoms: [
      'पर्याप्त पानी के बावजूद पौधों का मुरझाना',
      'निचली पत्तियों का पीला होकर गिरना',
      'जड़ों का काला पड़ना व सड़ना',
      'मिट्टी से दुर्गंध आना'
    ],
    cure: [
      'तुरंत सिंचाई रोकें और मिट्टी को सूखने दें',
      'ट्राइकोडर्मा विरिडी (5 ग्राम प्रति किग्रा मिट्टी) का प्रयोग करें',
      'जल निकासी वाली ताजा मिट्टी में पुन: रोपण करें',
      'मेटालेक्सिल 8% WP फफूंदनाशक का प्रयोग करें'
    ],
    prevention: [
      'अच्छी जल निकासी वाली मिट्टी का चुनाव करें',
      'क्यारियों में पानी जमा न होने दें'
    ]
  },
  nitrogen_deficiency: {
    name: 'नाइट्रोजन की कमी (Nitrogen Deficiency)',
    severity: 'मध्यम',
    causes: 'मिट्टी में नाइट्रोजन की कमी, भारी बारिश से लीचिंग',
    symptoms: [
      'निचली पुरानी पत्तियों का हल्का हरा से पीला होना',
      'पौधों की रुकी हुई वृद्धि',
      'पतले और कमजोर तने',
      'फूल और फल कम आना'
    ],
    cure: [
      'यूरिया (46-0-0) खाद 2-3 ग्राम प्रति पौधा या 2% यूरिया का पर्णीय छिड़काव करें',
      'वर्मीकम्पोस्ट (200 ग्राम प्रति पौधा) डालें',
      'गोबर की सड़ी खाद का उपयोग करें'
    ],
    prevention: [
      'नियमित मिट्टी की जांच कराएं',
      'दलहनी फसलों की फसल चक्र में शामिल करें'
    ]
  },
  phosphorus_deficiency: {
    name: 'फास्फोरस की कमी (Phosphorus Deficiency)',
    severity: 'मध्यम',
    causes: 'मिट्टी में फास्फोरस की कमी, अम्लीय या अधिक ठंडी मिट्टी',
    symptoms: [
      'पत्तियों पर बैंगनी या लालिमा युक्त धब्बे',
      'जड़ों का कमजोर विकास',
      'फसल पकने में देरी और पैदावार में कमी'
    ],
    cure: [
      'डीएपी (DAP 18:46:0) या सिंगल सुपर फास्फेट (SSP) डालें',
      'बोन मील या रॉक फास्फेट का प्रयोग करें',
      'मिट्टी का पीएच 6.0 से 7.0 के बीच संतुलित करें'
    ],
    prevention: [
      'बुवाई के समय फास्फोरस युक्त खाद की बेसल खुराक दें',
      'माइकोराइजा कल्चर का उपयोग करें'
    ]
  },
  potassium_deficiency: {
    name: 'पोटेशियम की कमी (Potassium Deficiency)',
    severity: 'मध्यम',
    causes: 'रेतीली हल्की मिट्टी, भारी बारिश से पोटाश का बहना',
    symptoms: [
      'पत्तियों के किनारों का झुलसना और भूरा होना',
      'कमजोर तने जो आसानी से टूट जाते हैं',
      'फलों का छोटा आकार और खराब गुणवत्ता'
    ],
    cure: [
      'म्यूरेट ऑफ पोटाश (MOP 60%) 3 ग्राम प्रति पौधा डालें',
      'लकड़ी की राख का छिड़काव करें',
      '1% पोटाश घोल का पर्णीय छिड़काव करें'
    ],
    prevention: [
      'नियमित रूप से पोटाश युक्त खाद डालें',
      'पोटाश युक्त कम्पोस्ट का प्रयोग करें'
    ]
  },
  pest_aphids: {
    name: 'माहू / एफिड कीट (Aphid Infestation)',
    severity: 'मध्यम',
    causes: 'एफिड कीट, कोमल पत्तियों का रस चूसना',
    symptoms: [
      'शाखाओं पर हरे/काले कीटों का समूह',
      'पत्तियों पर चिपचिपा शहद जैसा स्राव',
      'पत्तियों की विकृत बढ़वार और काली फफूंद'
    ],
    cure: [
      'नीम का तेल (5 मिली प्रति लीटर पानी) हर 7 दिन में छिड़कें',
      'तेज पानी की धार से कीटों को हटाएं',
      'इमिडाक्लोप्रिड 17.8% SL (0.5 मिली/लीटर) का छिड़काव करें'
    ],
    prevention: [
      'खेत में गेंदे के पौधे सह-फसल के रूप में लगाएं',
      'अत्यधिक नाइट्रोजन खाद से बचें'
    ]
  }
};

// Hindi translations for Fertilizers
const FERTILIZERS_HI = [
  {
    name: 'यूरिया (Urea 46% N)',
    type: 'रासायनिक नाइट्रोजन',
    npk: '46-0-0',
    dosage: '100-120 किग्रा / हेक्टेयर',
    application: 'वानस्पतिक बढ़वार के समय 2-3 भागों में शीर्ष ड्रेसिंग',
    crops: 'गेहूं, धान, मक्का, गन्ना, सभी सब्जियां',
    notes: 'हमेशा मिट्टी में नमी होने पर ही डालें, तेज धूप में न छिड़कें।'
  },
  {
    name: 'डीएपी (DAP 18:46:0)',
    type: 'फास्फेट उर्वरक',
    npk: '18-46-0',
    dosage: '80-100 किग्रा / हेक्टेयर',
    application: 'बुवाई या रोपाई के समय बेसल खुराक (जड़ों के पास)',
    crops: 'गेहूं, दलहन, तिलहन, आलू, टमाटर',
    notes: 'जड़ों के तेजी से विकास एवं कल्ले फूटने के लिए अनिवार्य।'
  },
  {
    name: 'एमओपी पोटाश (MOP 60%)',
    type: 'पोटाश उर्वरक',
    npk: '0-0-60',
    dosage: '40-50 किग्रा / हेक्टेयर',
    application: 'फूल आने से ठीक पहले या बुवाई के समय',
    crops: 'आलू, गन्ना, कपास, टमाटर, फलदार पौधे',
    notes: 'रोग प्रतिरोधक क्षमता बढ़ाता है तथा दाने और फल को चमकदार व वजनी बनाता है।'
  },
  {
    name: 'वर्मीकम्पोस्ट (केंचुआ खाद)',
    type: 'जैविक खाद',
    npk: '1.5-1.0-1.5 + सूक्ष्म पोषक तत्व',
    dosage: '2-3 टन / एकड़',
    application: 'खेत की अंतिम जुताई के समय या क्यारियों में',
    crops: 'सभी फसलें, फल, फूल, सब्जियां',
    notes: 'मिट्टी की जलधारण क्षमता बढ़ाता है और लाभदायक सूक्ष्मजीवों को सक्रिय करता है।'
  },
  {
    name: 'जिंक सल्फेट (Zinc Sulphate 33%)',
    type: 'सूक्ष्म पोषक तत्व',
    npk: 'Zn: 33%, S: 15%',
    dosage: '10-15 किग्रा / हेक्टेयर',
    application: 'बुवाई के समय (डीएपी के साथ मिलाकर तुरंत न डालें)',
    crops: 'धान (खैरा रोग हेतु), गेहूं, मक्का',
    notes: 'धान में खैरा रोग से बचाव के लिए अनिवार्य सूक्ष्म तत्व।'
  }
];

// Hindi translations for Watering Guide
const WATERING_GUIDE_HI = [
  {
    crop: 'टमाटर',
    frequency: 'गर्मियों में 3-4 दिन, सर्दियों में 7-8 दिन',
    depth: '1-1.5 इंच',
    criticalStages: 'रोपाई के समय, फूल आने पर, फल बनने की अवस्था',
    tips: 'ड्रिप सिंचाई सर्वोत्तम है। पत्तियों पर सीधे पानी देने से बचें ताकि फफूंद न लगे।'
  },
  {
    crop: 'गेहूं',
    frequency: 'फसल चक्र में 4 से 6 सिंचाई',
    depth: '2-2.5 इंच',
    criticalStages: 'क्राउन रूट (CRI 21 दिन), कल्ले फूटते समय (45 दिन), फूल आने पर (85 दिन)',
    tips: 'पहली सिंचाई (CRI) सबसे महत्वपूर्ण है। तेज हवा में सिंचाई न करें।'
  },
  {
    crop: 'धान (Paddy)',
    frequency: 'खेत में 2-5 सेमी जल स्तर बनाए रखें',
    depth: 'खड़ा पानी',
    criticalStages: 'कंस फूटते समय, बाली निकलते समय, दाना भरते समय',
    tips: 'कटाई से 10-12 दिन पहले खेत का पानी निकाल दें।'
  },
  {
    crop: 'मिर्च / बैंगन',
    frequency: '4-6 दिन के अंतराल पर',
    depth: '1 इंच',
    criticalStages: 'शाखाएं निकलते समय, फूल व फल आते समय',
    tips: 'खेत में पानी जमा न होने दें। जलभराव से उकठा (Wilt) रोग का खतरा बढ़ता है।'
  }
];

// Hindi translations for Farming Tips
const TIPS_HI = [
  {
    title: 'बीज शोधन (Seed Treatment)',
    tip: 'बुवाई से पहले बीजों को ट्राइकोडर्मा (5 ग्राम/किग्रा) या थीरम/बाविस्टिन (2 ग्राम/किग्रा) से अवश्य उपचारित करें।'
  },
  {
    title: 'पीले चिपचिपे ट्रैप (Yellow Traps)',
    tip: 'रस चूसक कीटों (माहू, सफेद मक्खी) से बचाव के लिए खेत में 8-10 पीले स्टिकी ट्रैप पौधे की ऊंचाई पर लगाएं।'
  },
  {
    title: 'संतुलित उर्वरक प्रयोग',
    tip: 'यूरिया का अंधाधुंध प्रयोग न करें। अत्यधिक यूरिया से फसल कोमल होकर कीटों व रोगों के प्रति संवेदनशील हो जाती है।'
  },
  {
    title: 'मल्चिंग का महत्व',
    tip: 'सब्जियों में पुआल या प्लास्टिक मल्चिंग करने से 40% तक पानी बचता है और खरपतवार की रोकथाम होती है।'
  }
];

/**
 * Translation helper function
 */
function t(key, lang = null) {
  const currentLang = lang || (window.state && window.state.lang) || 'en';
  if (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) {
    return TRANSLATIONS[currentLang][key];
  }
  if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
    return TRANSLATIONS['en'][key];
  }
  return key;
}

if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
  window.SCAN_SAMPLES_HI = SCAN_SAMPLES_HI;
  window.DISEASES_HI = DISEASES_HI;
  window.FERTILIZERS_HI = FERTILIZERS_HI;
  window.WATERING_GUIDE_HI = WATERING_GUIDE_HI;
  window.TIPS_HI = TIPS_HI;
  window.t = t;
}
