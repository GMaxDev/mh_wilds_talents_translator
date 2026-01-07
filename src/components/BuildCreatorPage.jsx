import { useState, useEffect, useRef } from "react";
import weaponsFullData from "../data/weapons-full.json";
import armorsFullData from "../data/armors-full.json";
import talentsData from "../data/skills.json";
import weaponTypeTranslations from "../data/weapon-type-translations.json";

// Traductions UI pour le Build Creator
const buildUITranslations = {
  buildCreator: {
    EN: "Build Creator",
    FR: "Créateur de Build",
    JP: "ビルド作成",
    JA: "ビルド作成",
    KO: "빌드 생성기",
    IT: "Creatore di Build",
    DE: "Build-Ersteller",
    ES: "Creador de Build",
    RU: "Создатель сборки",
    PL: "Kreator buildu",
    PT: "Criador de Build",
    AR: "منشئ البناء",
  },
  untitledSet: {
    EN: "Untitled Set",
    FR: "Set Sans Titre",
    JP: "無題のセット",
    JA: "無題のセット",
    KO: "제목 없는 세트",
    IT: "Set senza titolo",
    DE: "Unbenanntes Set",
    ES: "Set sin título",
    RU: "Безымянный набор",
    PL: "Zestaw bez nazwy",
    PT: "Set sem título",
    AR: "مجموعة بدون عنوان",
  },
  selectWeapon: {
    EN: "Select Weapon",
    FR: "Sélectionner Arme",
    JP: "武器を選択",
    JA: "武器を選択",
    KO: "무기 선택",
    IT: "Seleziona Arma",
    DE: "Waffe auswählen",
    ES: "Seleccionar Arma",
    RU: "Выбрать оружие",
    PL: "Wybierz broń",
    PT: "Selecionar Arma",
    AR: "اختر السلاح",
  },
  selectHead: {
    EN: "Select Head",
    FR: "Sélectionner Tête",
    JP: "頭を選択",
    JA: "頭を選択",
    KO: "머리 선택",
    IT: "Seleziona Testa",
    DE: "Kopf auswählen",
    ES: "Seleccionar Cabeza",
    RU: "Выбрать голову",
    PL: "Wybierz głowę",
    PT: "Selecionar Cabeça",
    AR: "اختر الرأس",
  },
  selectChest: {
    EN: "Select Chest",
    FR: "Sélectionner Torse",
    JP: "胴を選択",
    JA: "胴を選択",
    KO: "몸통 선택",
    IT: "Seleziona Torace",
    DE: "Brust auswählen",
    ES: "Seleccionar Torso",
    RU: "Выбрать торс",
    PL: "Wybierz tułów",
    PT: "Selecionar Peito",
    AR: "اختر الصدر",
  },
  selectArms: {
    EN: "Select Arms",
    FR: "Sélectionner Bras",
    JP: "腕を選択",
    JA: "腕を選択",
    KO: "팔 선택",
    IT: "Seleziona Braccia",
    DE: "Arme auswählen",
    ES: "Seleccionar Brazos",
    RU: "Выбрать руки",
    PL: "Wybierz ramiona",
    PT: "Selecionar Braços",
    AR: "اختر الذراعين",
  },
  selectWaist: {
    EN: "Select Waist",
    FR: "Sélectionner Taille",
    JP: "腰を選択",
    JA: "腰を選択",
    KO: "허리 선택",
    IT: "Seleziona Vita",
    DE: "Taille auswählen",
    ES: "Seleccionar Cintura",
    RU: "Выбрать пояс",
    PL: "Wybierz pas",
    PT: "Selecionar Cintura",
    AR: "اختر الخصر",
  },
  selectLegs: {
    EN: "Select Legs",
    FR: "Sélectionner Jambes",
    JP: "脚を選択",
    JA: "脚を選択",
    KO: "다리 선택",
    IT: "Seleziona Gambe",
    DE: "Beine auswählen",
    ES: "Seleccionar Piernas",
    RU: "Выбрать ноги",
    PL: "Wybierz nogi",
    PT: "Selecionar Pernas",
    AR: "اختر الساقين",
  },
  selectTalisman: {
    EN: "Select Talisman",
    FR: "Sélectionner Talisman",
    JP: "護石を選択",
    JA: "護石を選択",
    KO: "부적 선택",
    IT: "Seleziona Talismano",
    DE: "Talisman auswählen",
    ES: "Seleccionar Talismán",
    RU: "Выбрать талисман",
    PL: "Wybierz talizman",
    PT: "Selecionar Talismã",
    AR: "اختر التعويذة",
  },
  talents: {
    EN: "Talents",
    FR: "Talents",
    JP: "スキル",
    JA: "スキル",
    KO: "스킬",
    IT: "Abilità",
    DE: "Fertigkeiten",
    ES: "Habilidades",
    RU: "Навыки",
    PL: "Umiejętności",
    PT: "Habilidades",
    AR: "المهارات",
  },
  none: {
    EN: "None",
    FR: "Aucun",
    JP: "なし",
    JA: "なし",
    KO: "없음",
    IT: "Nessuno",
    DE: "Keine",
    ES: "Ninguno",
    RU: "Нет",
    PL: "Brak",
    PT: "Nenhum",
    AR: "لا شيء",
  },
  search: {
    EN: "Search",
    FR: "Rechercher",
    JP: "検索",
    JA: "検索",
    KO: "검색",
    IT: "Cerca",
    DE: "Suchen",
    ES: "Buscar",
    RU: "Поиск",
    PL: "Szukaj",
    PT: "Buscar",
    AR: "بحث",
  },
  reset: {
    EN: "Reset",
    FR: "Réinitialiser",
    JP: "リセット",
    JA: "リセット",
    KO: "초기화",
    IT: "Reimposta",
    DE: "Zurücksetzen",
    ES: "Restablecer",
    RU: "Сбросить",
    PL: "Resetuj",
    PT: "Redefinir",
    AR: "إعادة تعيين",
  },
  defense: {
    EN: "Defense",
    FR: "Défense",
    JP: "防御力",
    JA: "防御力",
    KO: "방어력",
    IT: "Difesa",
    DE: "Verteidigung",
    ES: "Defensa",
    RU: "Защита",
    PL: "Obrona",
    PT: "Defesa",
    AR: "الدفاع",
  },
  shareBuild: {
    EN: "Share Build",
    FR: "Partager le Build",
    JP: "ビルドを共有",
    JA: "ビルドを共有",
    KO: "빌드 공유",
    IT: "Condividi Build",
    DE: "Build teilen",
    ES: "Compartir Build",
    RU: "Поделиться сборкой",
    PL: "Udostępnij build",
    PT: "Compartilhar Build",
    AR: "مشاركة البناء",
  },
  linkCopied: {
    EN: "Link copied!",
    FR: "Lien copié !",
    JP: "リンクをコピーしました！",
    JA: "リンクをコピーしました！",
    KO: "링크 복사됨!",
    IT: "Link copiato!",
    DE: "Link kopiert!",
    ES: "¡Enlace copiado!",
    RU: "Ссылка скопирована!",
    PL: "Link skopiowany!",
    PT: "Link copiado!",
    AR: "تم نسخ الرابط!",
  },
  totalDefense: {
    EN: "Total Defense",
    FR: "Défense Totale",
    JP: "総防御力",
    JA: "総防御力",
    KO: "총 방어력",
    IT: "Difesa Totale",
    DE: "Gesamtverteidigung",
    ES: "Defensa Total",
    RU: "Общая защита",
    PL: "Całkowita obrona",
    PT: "Defesa Total",
    AR: "الدفاع الكلي",
  },
  slots: {
    EN: "Slots",
    FR: "Emplacements",
    JP: "スロット",
    JA: "スロット",
    KO: "슬롯",
    IT: "Slot",
    DE: "Slots",
    ES: "Ranuras",
    RU: "Слоты",
    PL: "Sloty",
    PT: "Compartimentos",
    AR: "الفتحات",
  },
  myBuilds: {
    EN: "My Builds",
    FR: "Mes Builds",
    JP: "マイビルド",
    JA: "マイビルド",
    KO: "내 빌드",
    IT: "I miei Build",
    DE: "Meine Builds",
    ES: "Mis Builds",
    RU: "Мои сборки",
    PL: "Moje buildy",
    PT: "Meus Builds",
    AR: "بنياتي",
  },
  saveBuild: {
    EN: "Save Build",
    FR: "Sauvegarder",
    JP: "ビルドを保存",
    JA: "ビルドを保存",
    KO: "빌드 저장",
    IT: "Salva Build",
    DE: "Build speichern",
    ES: "Guardar Build",
    RU: "Сохранить сборку",
    PL: "Zapisz build",
    PT: "Salvar Build",
    AR: "حفظ البناء",
  },
  savedBuilds: {
    EN: "Saved Builds",
    FR: "Builds Sauvegardés",
    JP: "保存されたビルド",
    JA: "保存されたビルド",
    KO: "저장된 빌드",
    IT: "Build Salvati",
    DE: "Gespeicherte Builds",
    ES: "Builds Guardados",
    RU: "Сохранённые сборки",
    PL: "Zapisane buildy",
    PT: "Builds Salvos",
    AR: "البنيات المحفوظة",
  },
  noSavedBuilds: {
    EN: "No saved builds yet",
    FR: "Aucun build sauvegardé",
    JP: "保存されたビルドはありません",
    JA: "保存されたビルドはありません",
    KO: "저장된 빌드가 없습니다",
    IT: "Nessun build salvato",
    DE: "Noch keine gespeicherten Builds",
    ES: "No hay builds guardados",
    RU: "Нет сохранённых сборок",
    PL: "Brak zapisanych buildów",
    PT: "Nenhum build salvo",
    AR: "لا توجد بنيات محفوظة",
  },
  load: {
    EN: "Load",
    FR: "Charger",
    JP: "ロード",
    JA: "ロード",
    KO: "불러오기",
    IT: "Carica",
    DE: "Laden",
    ES: "Cargar",
    RU: "Загрузить",
    PL: "Wczytaj",
    PT: "Carregar",
    AR: "تحميل",
  },
  rename: {
    EN: "Rename",
    FR: "Renommer",
    JP: "名前を変更",
    JA: "名前を変更",
    KO: "이름 변경",
    IT: "Rinomina",
    DE: "Umbenennen",
    ES: "Renombrar",
    RU: "Переименовать",
    PL: "Zmień nazwę",
    PT: "Renomear",
    AR: "إعادة تسمية",
  },
  delete: {
    EN: "Delete",
    FR: "Supprimer",
    JP: "削除",
    JA: "削除",
    KO: "삭제",
    IT: "Elimina",
    DE: "Löschen",
    ES: "Eliminar",
    RU: "Удалить",
    PL: "Usuń",
    PT: "Excluir",
    AR: "حذف",
  },
  confirmDelete: {
    EN: "Are you sure you want to delete this build?",
    FR: "Êtes-vous sûr de vouloir supprimer ce build ?",
    JP: "このビルドを削除してもよろしいですか？",
    JA: "このビルドを削除してもよろしいですか？",
    KO: "이 빌드를 삭제하시겠습니까?",
    IT: "Sei sicuro di voler eliminare questo build?",
    DE: "Sind Sie sicher, dass Sie diesen Build löschen möchten?",
    ES: "¿Estás seguro de que quieres eliminar este build?",
    RU: "Вы уверены, что хотите удалить эту сборку?",
    PL: "Czy na pewno chcesz usunąć ten build?",
    PT: "Tem certeza de que deseja excluir este build?",
    AR: "هل أنت متأكد أنك تريد حذف هذا البناء؟",
  },
  buildSaved: {
    EN: "Build saved!",
    FR: "Build sauvegardé !",
    JP: "ビルドを保存しました！",
    JA: "ビルドを保存しました！",
    KO: "빌드가 저장되었습니다!",
    IT: "Build salvato!",
    DE: "Build gespeichert!",
    ES: "¡Build guardado!",
    RU: "Сборка сохранена!",
    PL: "Build zapisany!",
    PT: "Build salvo!",
    AR: "تم حفظ البناء!",
  },
  newBuildName: {
    EN: "New build name:",
    FR: "Nouveau nom du build :",
    JP: "新しいビルド名：",
    JA: "新しいビルド名：",
    KO: "새 빌드 이름:",
    IT: "Nuovo nome del build:",
    DE: "Neuer Build-Name:",
    ES: "Nuevo nombre del build:",
    RU: "Новое название сборки:",
    PL: "Nowa nazwa buildu:",
    PT: "Novo nome do build:",
    AR: "اسم البناء الجديد:",
  },
  close: {
    EN: "Close",
    FR: "Fermer",
    JP: "閉じる",
    JA: "閉じる",
    KO: "닫기",
    IT: "Chiudi",
    DE: "Schließen",
    ES: "Cerrar",
    RU: "Закрыть",
    PL: "Zamknij",
    PT: "Fechar",
    AR: "إغلاق",
  },
  cancel: {
    EN: "Cancel",
    FR: "Annuler",
    JP: "キャンセル",
    JA: "キャンセル",
    KO: "취소",
    IT: "Annulla",
    DE: "Abbrechen",
    ES: "Cancelar",
    RU: "Отмена",
    PL: "Anuluj",
    PT: "Cancelar",
    AR: "إلغاء",
  },
  deleteConfirmTitle: {
    EN: "Delete Build",
    FR: "Supprimer le Build",
    JP: "ビルドを削除",
    JA: "ビルドを削除",
    KO: "빌드 삭제",
    IT: "Elimina Build",
    DE: "Build löschen",
    ES: "Eliminar Build",
    RU: "Удалить сборку",
    PL: "Usuń build",
    PT: "Excluir Build",
    AR: "حذف البناء",
  },
  filters: {
    EN: "Filters",
    FR: "Filtres",
    JP: "フィルター",
    JA: "フィルター",
    KO: "필터",
    IT: "Filtri",
    DE: "Filter",
    ES: "Filtros",
    RU: "Фильтры",
    PL: "Filtry",
    PT: "Filtros",
    AR: "فلاتر",
  },
  element: {
    EN: "Element",
    FR: "Élément",
    JP: "属性",
    JA: "属性",
    KO: "속성",
    IT: "Elemento",
    DE: "Element",
    ES: "Elemento",
    RU: "Стихия",
    PL: "Żywioł",
    PT: "Elemento",
    AR: "عنصر",
  },
  sortBy: {
    EN: "Sort by",
    FR: "Trier par",
    JP: "並び替え",
    JA: "並び替え",
    KO: "정렬",
    IT: "Ordina per",
    DE: "Sortieren",
    ES: "Ordenar por",
    RU: "Сортировать",
    PL: "Sortuj",
    PT: "Ordenar por",
    AR: "ترتيب حسب",
  },
  attack: {
    EN: "Attack",
    FR: "Attaque",
    JP: "攻撃力",
    JA: "攻撃力",
    KO: "공격력",
    IT: "Attacco",
    DE: "Angriff",
    ES: "Ataque",
    RU: "Атака",
    PL: "Atak",
    PT: "Ataque",
    AR: "هجوم",
  },
  affinity: {
    EN: "Affinity",
    FR: "Affinité",
    JP: "会心率",
    JA: "会心率",
    KO: "회심률",
    IT: "Affinità",
    DE: "Affinität",
    ES: "Afinidad",
    RU: "Сродство",
    PL: "Trafienie kryt.",
    PT: "Afinidade",
    AR: "ألفة",
  },
  name: {
    EN: "Name",
    FR: "Nom",
    JP: "名前",
    JA: "名前",
    KO: "이름",
    IT: "Nome",
    DE: "Name",
    ES: "Nombre",
    RU: "Название",
    PL: "Nazwa",
    PT: "Nome",
    AR: "اسم",
  },
  elementAttack: {
    EN: "Element Attack",
    FR: "Attaque Élémentaire",
    JP: "属性攻撃",
    JA: "属性攻撃",
    KO: "속성 공격",
    IT: "Attacco Elem.",
    DE: "Elem. Angriff",
    ES: "Ataque Elem.",
    RU: "Стих. атака",
    PL: "Atak żywiołu",
    PT: "Ataque Elem.",
    AR: "هجوم عنصري",
  },
  all: {
    EN: "All",
    FR: "Tous",
    JP: "すべて",
    JA: "すべて",
    KO: "전체",
    IT: "Tutti",
    DE: "Alle",
    ES: "Todos",
    RU: "Все",
    PL: "Wszystkie",
    PT: "Todos",
    AR: "الكل",
  },
  resetFilters: {
    EN: "Reset",
    FR: "Réinitialiser",
    JP: "リセット",
    JA: "リセット",
    KO: "초기화",
    IT: "Reset",
    DE: "Zurücksetzen",
    ES: "Restablecer",
    RU: "Сбросить",
    PL: "Resetuj",
    PT: "Redefinir",
    AR: "إعادة تعيين",
  },
  resistances: {
    EN: "Resistances",
    FR: "Résistances",
    JP: "耐性",
    JA: "耐性",
    KO: "내성",
    IT: "Resistenze",
    DE: "Resistenzen",
    ES: "Resistencias",
    RU: "Сопротивления",
    PL: "Odporności",
    PT: "Resistências",
    AR: "مقاومات",
  },
  minResistance: {
    EN: "Min. Resistance",
    FR: "Rés. min.",
    JP: "最小耐性",
    JA: "最小耐性",
    KO: "최소 내성",
    IT: "Res. min.",
    DE: "Min. Res.",
    ES: "Res. mín.",
    RU: "Мин. сопр.",
    PL: "Min. odp.",
    PT: "Res. mín.",
    AR: "أدنى مقاومة",
  },
};

// Traductions des éléments
const elementTranslations = {
  Fire: { EN: "Fire", FR: "Feu", JP: "火", JA: "火", KO: "화", IT: "Fuoco", DE: "Feuer", ES: "Fuego", RU: "Огонь", PL: "Ogień", PT: "Fogo", AR: "نار" },
  Water: { EN: "Water", FR: "Eau", JP: "水", JA: "水", KO: "수", IT: "Acqua", DE: "Wasser", ES: "Agua", RU: "Вода", PL: "Woda", PT: "Água", AR: "ماء" },
  Thunder: { EN: "Thunder", FR: "Foudre", JP: "雷", JA: "雷", KO: "뇌", IT: "Tuono", DE: "Donner", ES: "Rayo", RU: "Молния", PL: "Piorun", PT: "Trovão", AR: "برق" },
  Ice: { EN: "Ice", FR: "Glace", JP: "氷", JA: "氷", KO: "빙", IT: "Ghiaccio", DE: "Eis", ES: "Hielo", RU: "Лёд", PL: "Lód", PT: "Gelo", AR: "جليد" },
  Dragon: { EN: "Dragon", FR: "Dragon", JP: "龍", JA: "龍", KO: "용", IT: "Drago", DE: "Drache", ES: "Dragón", RU: "Дракон", PL: "Smok", PT: "Dragão", AR: "تنين" },
  Poison: { EN: "Poison", FR: "Poison", JP: "毒", JA: "毒", KO: "독", IT: "Veleno", DE: "Gift", ES: "Veneno", RU: "Яд", PL: "Trucizna", PT: "Veneno", AR: "سم" },
  Paralysis: { EN: "Paralysis", FR: "Paralysie", JP: "麻痺", JA: "麻痺", KO: "마비", IT: "Paralisi", DE: "Paralyse", ES: "Parálisis", RU: "Паралич", PL: "Paraliż", PT: "Paralisia", AR: "شلل" },
  Sleep: { EN: "Sleep", FR: "Sommeil", JP: "睡眠", JA: "睡眠", KO: "수면", IT: "Sonno", DE: "Schlaf", ES: "Sueño", RU: "Сон", PL: "Sen", PT: "Sono", AR: "نوم" },
  Blast: { EN: "Blast", FR: "Explosion", JP: "爆破", JA: "爆破", KO: "폭파", IT: "Scoppio", DE: "Explosion", ES: "Explosión", RU: "Взрыв", PL: "Wybuch", PT: "Explosão", AR: "انفجار" },
};

// Liste des éléments disponibles
const ELEMENTS = ["Fire", "Water", "Thunder", "Ice", "Dragon", "Poison", "Paralysis", "Sleep", "Blast"];

// Icons
const WeaponIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/>
    <path d="m16 16 6-6"/>
    <path d="m8 8 6-6"/>
    <path d="m9 7 8 8"/>
    <path d="m21 11-11 11"/>
  </svg>
);

const HeadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const ChestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/>
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/>
    <path d="M2 21h20"/>
    <path d="M7 8v2"/>
    <path d="M17 8v2"/>
    <path d="M12 8v2"/>
    <path d="M3 11h18"/>
  </svg>
);

const ArmsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/>
    <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v6"/>
    <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);

const WaistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="6" x="3" y="9" rx="1"/>
    <path d="M5 15v4"/>
    <path d="M19 15v4"/>
    <path d="M12 9v6"/>
  </svg>
);

const LegsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4v16"/>
    <path d="M17 4v16"/>
    <path d="M3 8h4"/>
    <path d="M17 8h4"/>
    <path d="M3 16h4"/>
    <path d="M17 16h4"/>
  </svg>
);

const TalismanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l4 6-10 13L2 9z"/>
    <path d="M11 3 8 9l4 13 4-13-3-6"/>
    <path d="M2 9h20"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

// Icône sauvegarde
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

// Icône liste
const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

// Icône poubelle
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

// Icône édition/crayon
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

// Fonction pour obtenir le texte traduit
const getUIText = (key, lang) => {
  return buildUITranslations[key]?.[lang] || buildUITranslations[key]?.EN || key;
};

// Fonction pour rendre les slots visuellement
const renderSlots = (slots, darkMode) => {
  if (!slots || slots.length === 0) return <span className="text-gray-500">—</span>;
  
  return (
    <div className="flex gap-1">
      {slots.map((slotLevel, index) => {
        if (slotLevel === 0) return null;
        const colors = {
          1: darkMode ? "bg-gray-600" : "bg-gray-400",
          2: darkMode ? "bg-blue-600" : "bg-blue-400",
          3: darkMode ? "bg-yellow-600" : "bg-yellow-400",
          4: darkMode ? "bg-purple-600" : "bg-purple-400",
        };
        return (
          <span
            key={index}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${colors[slotLevel] || colors[1]}`}
          >
            {slotLevel}
          </span>
        );
      })}
    </div>
  );
};

// Composant pour la modal de sélection d'équipement
function EquipmentSelectionModal({
  isOpen,
  onClose,
  type, // "weapon", "head", "chest", "arms", "waist", "legs"
  onSelect,
  darkMode,
  language,
  availableLanguages,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWeaponType, setSelectedWeaponType] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [sortBy, setSortBy] = useState("name"); // "name", "attack", "defense", "affinity", "elementAttack", "fire", "water", "thunder", "ice", "dragon"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc", "desc"
  const [minResistance, setMinResistance] = useState({ fire: null, water: null, thunder: null, ice: null, dragon: null });
  const searchInputRef = useRef(null);

  // Éléments de résistance pour les armures
  const ARMOR_RESISTANCES = ["fire", "water", "thunder", "ice", "dragon"];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setSearchQuery("");
      setSelectedWeaponType(null);
      setSelectedElement(null);
      setSortBy("name");
      setSortOrder("desc");
      setMinResistance({ fire: null, water: null, thunder: null, ice: null, dragon: null });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Types d'armes disponibles
  const weaponTypes = Object.keys(weaponTypeTranslations);

  // Fonction de réinitialisation des filtres
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedWeaponType(null);
    setSelectedElement(null);
    setSortBy("name");
    setSortOrder("desc");
    setMinResistance({ fire: null, water: null, thunder: null, ice: null, dragon: null });
  };

  // Filtrer les équipements
  let filteredItems = [];

  if (type === "weapon") {
    filteredItems = Object.entries(weaponsFullData)
      .filter(([, weapon]) => {
        const weaponData = weapon[language] || weapon.EN;
        if (!weaponData) return false;

        // Filtre par type d'arme
        if (selectedWeaponType) {
          const weaponTypeName = weaponTypeTranslations[selectedWeaponType]?.[language] ||
                                  weaponTypeTranslations[selectedWeaponType]?.EN ||
                                  selectedWeaponType;
          if (weaponData.type !== weaponTypeName && weaponData.type !== selectedWeaponType) {
            // Vérifier aussi en anglais
            const enWeaponData = weapon.EN;
            if (!enWeaponData || enWeaponData.type !== selectedWeaponType) {
              return false;
            }
          }
        }

        // Filtre par élément
        if (selectedElement) {
          const enWeaponData = weapon.EN;
          if (!enWeaponData?.element || enWeaponData.element !== selectedElement) {
            return false;
          }
        }

        // Recherche multilingue
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          // Chercher dans toutes les langues
          const matchesAnyLang = availableLanguages.some((lang) => {
            const langData = weapon[lang];
            if (!langData) return false;
            const matchesName = langData.name?.toLowerCase().includes(query);
            const matchesType = langData.type?.toLowerCase().includes(query);
            const matchesSkill = langData.skills?.some(([skillName]) =>
              skillName?.toLowerCase().includes(query)
            );
            return matchesName || matchesType || matchesSkill;
          });
          return matchesAnyLang;
        }

        return true;
      })
      .map(([id, weapon]) => ({
        id,
        data: weapon[language] || weapon.EN,
        allData: weapon,
      }));

    // Tri des armes
    filteredItems.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "attack":
          comparison = (b.data.attack || 0) - (a.data.attack || 0);
          break;
        case "affinity":
          comparison = (b.data.affinity || 0) - (a.data.affinity || 0);
          break;
        case "elementAttack":
          comparison = (b.data.elementAttack || 0) - (a.data.elementAttack || 0);
          break;
        case "name":
        default:
          comparison = (a.data.name || "").localeCompare(b.data.name || "");
          break;
      }
      return sortOrder === "asc" ? -comparison : comparison;
    });
  } else {
    // Pour les armures
    const armorTypeMap = {
      head: "head",
      chest: "chest",
      arms: "arms",
      waist: "waist",
      legs: "legs",
    };

    const armorPieceType = armorTypeMap[type];

    filteredItems = Object.entries(armorsFullData)
      .filter(([, armorSet]) => {
        const armorData = armorSet[language] || armorSet.EN;
        if (!armorData?.pieces?.[armorPieceType]) return false;

        const piece = armorData.pieces[armorPieceType];

        // Filtre par résistance minimale
        for (const resType of ARMOR_RESISTANCES) {
          if (minResistance[resType] !== null && minResistance[resType] !== "") {
            const minVal = parseInt(minResistance[resType], 10);
            if (!isNaN(minVal) && (piece.resistances?.[resType] || 0) < minVal) {
              return false;
            }
          }
        }

        // Recherche multilingue
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesAnyLang = availableLanguages.some((lang) => {
            const langData = armorSet[lang];
            if (!langData?.pieces?.[armorPieceType]) return false;
            const langPiece = langData.pieces[armorPieceType];
            const matchesSetName = langData.name?.toLowerCase().includes(query);
            const matchesPieceName = langPiece.name?.toLowerCase().includes(query);
            const matchesSkill = langPiece.skills?.some((skill) =>
              skill.name?.toLowerCase().includes(query)
            );
            return matchesSetName || matchesPieceName || matchesSkill;
          });
          return matchesAnyLang;
        }

        return true;
      })
      .map(([id, armorSet]) => {
        const armorData = armorSet[language] || armorSet.EN;
        return {
          id,
          pieceType: armorPieceType,
          setId: id,
          data: armorData.pieces[armorPieceType],
          setData: armorData,
          allData: armorSet,
        };
      });

    // Tri des armures
    filteredItems.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "defense":
          comparison = (b.data.defense || 0) - (a.data.defense || 0);
          break;
        case "fire":
          comparison = (b.data.resistances?.fire || 0) - (a.data.resistances?.fire || 0);
          break;
        case "water":
          comparison = (b.data.resistances?.water || 0) - (a.data.resistances?.water || 0);
          break;
        case "thunder":
          comparison = (b.data.resistances?.thunder || 0) - (a.data.resistances?.thunder || 0);
          break;
        case "ice":
          comparison = (b.data.resistances?.ice || 0) - (a.data.resistances?.ice || 0);
          break;
        case "dragon":
          comparison = (b.data.resistances?.dragon || 0) - (a.data.resistances?.dragon || 0);
          break;
        case "name":
        default:
          comparison = (a.data.name || "").localeCompare(b.data.name || "");
          break;
      }
      return sortOrder === "asc" ? -comparison : comparison;
    });
  }

  const modalTitle = type === "weapon"
    ? getUIText("selectWeapon", language)
    : type === "head"
    ? getUIText("selectHead", language)
    : type === "chest"
    ? getUIText("selectChest", language)
    : type === "arms"
    ? getUIText("selectArms", language)
    : type === "waist"
    ? getUIText("selectWaist", language)
    : getUIText("selectLegs", language);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col ${
          darkMode ? "bg-slate-900" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            darkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-bold ${
              darkMode ? "text-amber-100" : "text-gray-900"
            }`}
          >
            {modalTitle}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              darkMode
                ? "hover:bg-slate-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search & Filters */}
        <div className={`p-4 border-b ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <div
              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <SearchIcon />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={getUIText("search", language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 w-full h-10 rounded-lg px-4 focus:outline-none focus:ring-2 ${
                darkMode
                  ? "bg-slate-800 text-white border-slate-600 focus:ring-cyan-500"
                  : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-amber-500"
              }`}
            />
          </div>

          {/* Filtres pour les armes */}
          {type === "weapon" && (
            <div className="space-y-3">
              {/* Filtres par type d'arme */}
              <div className="flex flex-wrap gap-2">
                {weaponTypes.map((wType) => (
                  <button
                    key={wType}
                    onClick={() =>
                      setSelectedWeaponType(
                        selectedWeaponType === wType ? null : wType
                      )
                    }
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedWeaponType === wType
                        ? darkMode
                          ? "bg-cyan-600 text-white"
                          : "bg-amber-500 text-white"
                        : darkMode
                        ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {weaponTypeTranslations[wType]?.[language] ||
                      weaponTypeTranslations[wType]?.EN ||
                      wType}
                  </button>
                ))}
              </div>

              {/* Filtres par élément */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {getUIText("element", language)}:
                </span>
                <button
                  onClick={() => setSelectedElement(null)}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    selectedElement === null
                      ? darkMode
                        ? "bg-cyan-600 text-white"
                        : "bg-amber-500 text-white"
                      : darkMode
                      ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {getUIText("all", language)}
                </button>
                {ELEMENTS.map((elem) => (
                  <button
                    key={elem}
                    onClick={() => setSelectedElement(selectedElement === elem ? null : elem)}
                    className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                      selectedElement === elem
                        ? darkMode
                          ? "bg-cyan-600 text-white"
                          : "bg-amber-500 text-white"
                        : darkMode
                        ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {elementTranslations[elem]?.[language] || elem}
                  </button>
                ))}
              </div>

              {/* Tri */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {getUIText("sortBy", language)}:
                </span>
                {[
                  { key: "name", label: getUIText("name", language) },
                  { key: "attack", label: getUIText("attack", language) },
                  { key: "affinity", label: getUIText("affinity", language) },
                  { key: "elementAttack", label: getUIText("elementAttack", language) },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (sortBy === key) {
                        setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                      } else {
                        setSortBy(key);
                        setSortOrder("desc");
                      }
                    }}
                    className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                      sortBy === key
                        ? darkMode
                          ? "bg-cyan-600 text-white"
                          : "bg-amber-500 text-white"
                        : darkMode
                        ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {label}
                    {sortBy === key && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </button>
                ))}

                {/* Bouton reset */}
                <button
                  onClick={resetFilters}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ml-auto ${
                    darkMode
                      ? "bg-red-900/50 text-red-300 hover:bg-red-800/50"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {getUIText("resetFilters", language)}
                </button>
              </div>
            </div>
          )}

          {/* Filtres pour les armures */}
          {type !== "weapon" && (
            <div className="space-y-3">
              {/* Tri */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {getUIText("sortBy", language)}:
                </span>
                {[
                  { key: "name", label: getUIText("name", language) },
                  { key: "defense", label: getUIText("defense", language) },
                  { key: "fire", label: "🔥" },
                  { key: "water", label: "💧" },
                  { key: "thunder", label: "⚡" },
                  { key: "ice", label: "❄️" },
                  { key: "dragon", label: "🐉" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (sortBy === key) {
                        setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                      } else {
                        setSortBy(key);
                        setSortOrder("desc");
                      }
                    }}
                    className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                      sortBy === key
                        ? darkMode
                          ? "bg-cyan-600 text-white"
                          : "bg-amber-500 text-white"
                        : darkMode
                        ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {label}
                    {sortBy === key && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </button>
                ))}

                {/* Bouton reset */}
                <button
                  onClick={resetFilters}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ml-auto ${
                    darkMode
                      ? "bg-red-900/50 text-red-300 hover:bg-red-800/50"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {getUIText("resetFilters", language)}
                </button>
              </div>

              {/* Filtres par résistance minimale */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {getUIText("minResistance", language)}:
                </span>
                {ARMOR_RESISTANCES.map((resType) => {
                  const icons = { fire: "🔥", water: "💧", thunder: "⚡", ice: "❄️", dragon: "🐉" };
                  const elementKey = resType.charAt(0).toUpperCase() + resType.slice(1);
                  return (
                    <div key={resType} className="flex items-center gap-1">
                      <span title={elementTranslations[elementKey]?.[language] || resType}>
                        {icons[resType]}
                      </span>
                      <input
                        type="number"
                        value={minResistance[resType] ?? ""}
                        onChange={(e) => setMinResistance(prev => ({ ...prev, [resType]: e.target.value }))}
                        placeholder="0"
                        className={`w-12 h-7 text-xs text-center rounded border focus:outline-none focus:ring-1 ${
                          darkMode
                            ? "bg-slate-700 border-slate-600 text-white focus:ring-cyan-500"
                            : "bg-white border-gray-300 text-gray-900 focus:ring-amber-500"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Liste des équipements */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <div
              className={`text-center py-8 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {getUIText("none", language)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id + (item.pieceType || "")}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    darkMode
                      ? "bg-slate-800 hover:bg-slate-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {type === "weapon" ? (
                    // Affichage arme
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            darkMode ? "text-amber-100" : "text-gray-900"
                          }`}
                        >
                          {item.data.name}
                        </div>
                        {/* Nom anglais si différent */}
                        {language !== "EN" && item.allData.EN?.name !== item.data.name && (
                          <div
                            className={`text-xs italic ${
                              darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            EN: {item.allData.EN?.name}
                          </div>
                        )}
                        <div
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {item.data.skills?.map(([name, level]) => `${name} Lv.${level}`).join(", ") || "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {item.data.affinity > 0 && (
                          <span className={`${darkMode ? "text-cyan-400" : "text-blue-600"}`}>
                            ✦ {Math.round(item.data.affinity * 100)}%
                          </span>
                        )}
                        {item.data.element && (
                          <span className={`${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                            🔥 {item.data.elementAttack}
                          </span>
                        )}
                        <span className={`${darkMode ? "text-amber-100" : "text-gray-900"}`}>
                          ⚔️ {item.data.attack}
                        </span>
                        {renderSlots(item.data.slots, darkMode)}
                      </div>
                    </div>
                  ) : (
                    // Affichage pièce d'armure
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium ${
                            darkMode ? "text-amber-100" : "text-gray-900"
                          }`}
                        >
                          {item.data.name}
                        </div>
                        {/* Nom anglais si différent */}
                        {language !== "EN" && item.allData.EN?.pieces?.[item.pieceType]?.name !== item.data.name && (
                          <div
                            className={`text-xs italic ${
                              darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            EN: {item.allData.EN?.pieces?.[item.pieceType]?.name}
                          </div>
                        )}
                        <div
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {item.data.skills?.map((s) => `${s.name} Lv.${s.level}`).join(", ") || "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm flex-shrink-0">
                        {/* Défense */}
                        <span className={`${darkMode ? "text-amber-100" : "text-gray-900"}`}>
                          🛡️ {item.data.defense}
                        </span>
                        {/* Résistances élémentaires */}
                        {item.data.resistances && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className={item.data.resistances.fire > 0 ? "text-red-400" : item.data.resistances.fire < 0 ? "text-red-600" : darkMode ? "text-gray-500" : "text-gray-400"}>
                              🔥{item.data.resistances.fire >= 0 ? "+" : ""}{item.data.resistances.fire}
                            </span>
                            <span className={item.data.resistances.water > 0 ? "text-blue-400" : item.data.resistances.water < 0 ? "text-blue-600" : darkMode ? "text-gray-500" : "text-gray-400"}>
                              💧{item.data.resistances.water >= 0 ? "+" : ""}{item.data.resistances.water}
                            </span>
                            <span className={item.data.resistances.thunder > 0 ? "text-yellow-400" : item.data.resistances.thunder < 0 ? "text-yellow-600" : darkMode ? "text-gray-500" : "text-gray-400"}>
                              ⚡{item.data.resistances.thunder >= 0 ? "+" : ""}{item.data.resistances.thunder}
                            </span>
                            <span className={item.data.resistances.ice > 0 ? "text-cyan-400" : item.data.resistances.ice < 0 ? "text-cyan-600" : darkMode ? "text-gray-500" : "text-gray-400"}>
                              ❄️{item.data.resistances.ice >= 0 ? "+" : ""}{item.data.resistances.ice}
                            </span>
                            <span className={item.data.resistances.dragon > 0 ? "text-purple-400" : item.data.resistances.dragon < 0 ? "text-purple-600" : darkMode ? "text-gray-500" : "text-gray-400"}>
                              🐉{item.data.resistances.dragon >= 0 ? "+" : ""}{item.data.resistances.dragon}
                            </span>
                          </div>
                        )}
                        {renderSlots(item.data.slots, darkMode)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icône globe pour le sélecteur de langue
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

// Icône partage
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

// Icône check
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// Fonctions d'encodage/décodage du build dans l'URL
const encodeBuildToURL = (buildName, selectedEquipment, language) => {
  const buildData = {
    n: buildName || "",
    l: language,
    w: selectedEquipment.weapon?.id || null,
    h: selectedEquipment.head?.setId || null,
    c: selectedEquipment.chest?.setId || null,
    a: selectedEquipment.arms?.setId || null,
    t: selectedEquipment.waist?.setId || null,
    g: selectedEquipment.legs?.setId || null,
  };
  
  // Encoder en base64 pour garder l'URL courte
  const jsonString = JSON.stringify(buildData);
  const base64 = btoa(encodeURIComponent(jsonString));
  return base64;
};

const decodeBuildFromURL = (encoded, lang) => {
  try {
    const jsonString = decodeURIComponent(atob(encoded));
    const buildData = JSON.parse(jsonString);
    
    const equipment = {
      weapon: null,
      head: null,
      chest: null,
      arms: null,
      waist: null,
      legs: null,
      talisman: null,
    };
    
    // Restaurer l'arme
    if (buildData.w && weaponsFullData[buildData.w]) {
      const weaponAllData = weaponsFullData[buildData.w];
      equipment.weapon = {
        id: buildData.w,
        data: weaponAllData[lang] || weaponAllData.EN,
        allData: weaponAllData,
      };
    }
    
    // Restaurer les pièces d'armure
    const pieceMapping = {
      h: "head",
      c: "chest",
      a: "arms",
      t: "waist",
      g: "legs",
    };
    
    Object.entries(pieceMapping).forEach(([key, pieceType]) => {
      const setId = buildData[key];
      if (setId && armorsFullData[setId]) {
        const armorAllData = armorsFullData[setId];
        const armorData = armorAllData[lang] || armorAllData.EN;
        if (armorData?.pieces?.[pieceType]) {
          equipment[pieceType] = {
            id: setId,
            pieceType,
            setId,
            data: armorData.pieces[pieceType],
            setData: armorData,
            allData: armorAllData,
          };
        }
      }
    });
    
    return {
      buildName: buildData.n || "",
      language: buildData.l || lang,
      equipment,
    };
  } catch (e) {
    console.error("Failed to decode build from URL:", e);
    return null;
  }
};

// Composant principal du Build Creator
export default function BuildCreatorPage({ darkMode, initialLanguage = "FR" }) {
  const [buildName, setBuildName] = useState("");
  const [language, setLanguage] = useState(initialLanguage);
  const [selectedEquipment, setSelectedEquipment] = useState({
    weapon: null,
    head: null,
    chest: null,
    arms: null,
    waist: null,
    legs: null,
    talisman: null,
  });
  const [modalOpen, setModalOpen] = useState(null); // Type d'équipement ouvert dans la modal
  const [availableLanguages, setAvailableLanguages] = useState(["EN", "FR"]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [showSavedBuildsModal, setShowSavedBuildsModal] = useState(false);
  const [buildSavedMessage, setBuildSavedMessage] = useState(false);
  const [editingBuildId, setEditingBuildId] = useState(null);
  const [editingBuildName, setEditingBuildName] = useState("");
  const [deletingBuildId, setDeletingBuildId] = useState(null);

  // Charger les builds sauvegardés depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mhwilds_saved_builds");
    if (saved) {
      try {
        setSavedBuilds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved builds:", e);
      }
    }
  }, []);

  // Charger le build depuis l'URL au montage du composant
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const buildParam = urlParams.get("build");
    
    if (buildParam) {
      const decoded = decodeBuildFromURL(buildParam, initialLanguage);
      if (decoded) {
        setBuildName(decoded.buildName);
        setLanguage(decoded.language);
        setSelectedEquipment(decoded.equipment);
      }
    }
  }, [initialLanguage]);

  useEffect(() => {
    // Déterminer les langues disponibles
    if (Object.keys(talentsData).length > 0) {
      const firstTalent = Object.keys(talentsData)[0];
      setAvailableLanguages(Object.keys(talentsData[firstTalent]));
    }
  }, []);

  // Mettre à jour les données d'équipement quand la langue change
  const updateEquipmentLanguage = (newLang) => {
    setLanguage(newLang);
    // Mettre à jour les données affichées pour chaque équipement sélectionné
    setSelectedEquipment((prev) => {
      const updated = { ...prev };
      
      // Mettre à jour l'arme
      if (prev.weapon) {
        const weaponAllData = prev.weapon.allData;
        updated.weapon = {
          ...prev.weapon,
          data: weaponAllData[newLang] || weaponAllData.EN,
        };
      }
      
      // Mettre à jour les pièces d'armure
      ["head", "chest", "arms", "waist", "legs"].forEach((pieceType) => {
        if (prev[pieceType]) {
          const armorAllData = prev[pieceType].allData;
          const armorData = armorAllData[newLang] || armorAllData.EN;
          updated[pieceType] = {
            ...prev[pieceType],
            data: armorData.pieces[pieceType],
            setData: armorData,
          };
        }
      });
      
      return updated;
    });
  };

  // Calculer les talents cumulés
  const calculateTotalSkills = () => {
    const skillsMap = {};

    // Ajouter les skills de l'arme
    if (selectedEquipment.weapon?.data?.skills) {
      selectedEquipment.weapon.data.skills.forEach(([name, level]) => {
        if (!skillsMap[name]) {
          skillsMap[name] = { name, level: 0 };
        }
        skillsMap[name].level += level;
      });
    }

    // Ajouter les skills des pièces d'armure
    ["head", "chest", "arms", "waist", "legs"].forEach((pieceType) => {
      const piece = selectedEquipment[pieceType];
      if (piece?.data?.skills) {
        piece.data.skills.forEach((skill) => {
          if (!skillsMap[skill.name]) {
            skillsMap[skill.name] = { name: skill.name, level: 0 };
          }
          skillsMap[skill.name].level += skill.level;
        });
      }
    });

    return Object.values(skillsMap).sort((a, b) => b.level - a.level);
  };

  // Calculer la défense totale
  const calculateTotalDefense = () => {
    let total = 0;
    ["head", "chest", "arms", "waist", "legs"].forEach((pieceType) => {
      const piece = selectedEquipment[pieceType];
      if (piece?.data?.defense) {
        total += piece.data.defense;
      }
    });
    return total;
  };

  // Calculer tous les slots disponibles
  const calculateTotalSlots = () => {
    const allSlots = [];

    // Slots de l'arme
    if (selectedEquipment.weapon?.data?.slots) {
      selectedEquipment.weapon.data.slots.forEach((slot) => {
        if (slot > 0) allSlots.push(slot);
      });
    }

    // Slots des pièces d'armure
    ["head", "chest", "arms", "waist", "legs"].forEach((pieceType) => {
      const piece = selectedEquipment[pieceType];
      if (piece?.data?.slots) {
        piece.data.slots.forEach((slot) => {
          if (slot > 0) allSlots.push(slot);
        });
      }
    });

    return allSlots.sort((a, b) => b - a);
  };

  const handleSelect = (type, item) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      [type]: item,
    }));
  };

  const handleReset = () => {
    setSelectedEquipment({
      weapon: null,
      head: null,
      chest: null,
      arms: null,
      waist: null,
      legs: null,
      talisman: null,
    });
    setBuildName("");
    // Nettoyer l'URL
    window.history.replaceState({}, "", window.location.pathname);
  };

  // Fonction pour partager le build via l'URL
  const handleShareBuild = async () => {
    const encoded = encodeBuildToURL(buildName, selectedEquipment, language);
    const url = `${window.location.origin}${window.location.pathname}?build=${encoded}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Sauvegarder le build dans localStorage
  const handleSaveBuild = () => {
    const name = buildName.trim() || `Build ${savedBuilds.length + 1}`;
    const encoded = encodeBuildToURL(name, selectedEquipment, language);
    
    const newBuild = {
      id: Date.now().toString(),
      name,
      encoded,
      createdAt: new Date().toISOString(),
      language,
    };
    
    const updatedBuilds = [...savedBuilds, newBuild];
    setSavedBuilds(updatedBuilds);
    localStorage.setItem("mhwilds_saved_builds", JSON.stringify(updatedBuilds));
    setBuildName(name);
    
    // Afficher le message de confirmation
    setBuildSavedMessage(true);
    setTimeout(() => setBuildSavedMessage(false), 2000);
  };

  // Charger un build sauvegardé
  const handleLoadBuild = (build) => {
    const decoded = decodeBuildFromURL(build.encoded, language);
    if (decoded) {
      setBuildName(decoded.buildName);
      setLanguage(decoded.language);
      setSelectedEquipment(decoded.equipment);
    }
    setShowSavedBuildsModal(false);
  };

  // Supprimer un build sauvegardé
  const handleDeleteBuild = (buildId) => {
    setDeletingBuildId(buildId);
  };

  // Confirmer la suppression du build
  const confirmDeleteBuild = () => {
    if (deletingBuildId) {
      const updatedBuilds = savedBuilds.filter((b) => b.id !== deletingBuildId);
      setSavedBuilds(updatedBuilds);
      localStorage.setItem("mhwilds_saved_builds", JSON.stringify(updatedBuilds));
      setDeletingBuildId(null);
    }
  };

  // Renommer un build sauvegardé
  const handleRenameBuild = (buildId) => {
    const build = savedBuilds.find((b) => b.id === buildId);
    if (build) {
      setEditingBuildId(buildId);
      setEditingBuildName(build.name);
    }
  };

  // Sauvegarder le nouveau nom du build
  const handleSaveRename = (buildId) => {
    if (editingBuildName.trim()) {
      const updatedBuilds = savedBuilds.map((b) => {
        if (b.id === buildId) {
          // Mettre à jour le nom dans l'encodage aussi
          const decoded = decodeBuildFromURL(b.encoded, language);
          if (decoded) {
            const newEncoded = encodeBuildToURL(editingBuildName.trim(), decoded.equipment, decoded.language);
            return { ...b, name: editingBuildName.trim(), encoded: newEncoded };
          }
          return { ...b, name: editingBuildName.trim() };
        }
        return b;
      });
      setSavedBuilds(updatedBuilds);
      localStorage.setItem("mhwilds_saved_builds", JSON.stringify(updatedBuilds));
    }
    setEditingBuildId(null);
    setEditingBuildName("");
  };

  const totalSkills = calculateTotalSkills();
  const totalDefense = calculateTotalDefense();
  const totalSlots = calculateTotalSlots();

  const equipmentSlots = [
    { type: "weapon", icon: WeaponIcon, label: "selectWeapon" },
    { type: "head", icon: HeadIcon, label: "selectHead" },
    { type: "chest", icon: ChestIcon, label: "selectChest" },
    { type: "arms", icon: ArmsIcon, label: "selectArms" },
    { type: "waist", icon: WaistIcon, label: "selectWaist" },
    { type: "legs", icon: LegsIcon, label: "selectLegs" },
    { type: "talisman", icon: TalismanIcon, label: "selectTalisman" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header avec titre, sélecteur de langue et bouton reset */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            placeholder={getUIText("untitledSet", language)}
            className={`text-2xl font-bold bg-transparent border-none focus:outline-none w-full ${
              darkMode ? "text-amber-100 placeholder-amber-100/50" : "text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
        
        {/* Sélecteur de langue */}
        <div className="flex items-center gap-2">
          <GlobeIcon />
          <select
            value={language}
            onChange={(e) => updateEquipmentLanguage(e.target.value)}
            className={`rounded-lg px-3 py-2 text-sm backdrop-blur-md border focus:outline-none focus:ring-2 ${
              darkMode
                ? "bg-slate-800/50 text-amber-100 border-slate-600 focus:ring-cyan-500"
                : "bg-white/80 text-gray-900 border-gray-300 focus:ring-amber-500"
            }`}
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        
        {/* Bouton de partage */}
        <button
          onClick={handleShareBuild}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            linkCopied
              ? darkMode
                ? "bg-green-900/50 text-green-300"
                : "bg-green-100 text-green-700"
              : darkMode
              ? "bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/50"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {linkCopied ? <CheckIcon /> : <ShareIcon />}
          <span className="hidden sm:inline">
            {linkCopied ? getUIText("linkCopied", language) : getUIText("shareBuild", language)}
          </span>
        </button>
        
        {/* Bouton de sauvegarde */}
        <button
          onClick={handleSaveBuild}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            buildSavedMessage
              ? darkMode
                ? "bg-green-900/50 text-green-300"
                : "bg-green-100 text-green-700"
              : darkMode
              ? "bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/50"
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          }`}
        >
          {buildSavedMessage ? <CheckIcon /> : <SaveIcon />}
          <span className="hidden sm:inline">
            {buildSavedMessage ? getUIText("buildSaved", language) : getUIText("saveBuild", language)}
          </span>
        </button>
        
        {/* Bouton Mes Builds */}
        <button
          onClick={() => setShowSavedBuildsModal(true)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            darkMode
              ? "bg-purple-900/50 text-purple-300 hover:bg-purple-800/50"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          }`}
        >
          <ListIcon />
          <span className="hidden sm:inline">{getUIText("myBuilds", language)}</span>
          {savedBuilds.length > 0 && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              darkMode ? "bg-purple-700 text-purple-100" : "bg-purple-200 text-purple-800"
            }`}>
              {savedBuilds.length}
            </span>
          )}
        </button>
        
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-lg transition-colors ${
            darkMode
              ? "bg-red-900/50 text-red-300 hover:bg-red-800/50"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          {getUIText("reset", language)}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : Équipements */}
        <div className="lg:col-span-2">
          <div
            className={`rounded-xl p-6 ${
              darkMode ? "bg-slate-800/50" : "bg-white/80"
            }`}
          >
            <div className="space-y-4">
              {equipmentSlots.map(({ type, icon: IconComponent, label }) => {
                const equipment = selectedEquipment[type];
                const isWeapon = type === "weapon";
                const isTalisman = type === "talisman";

                return (
                  <div
                    key={type}
                    onClick={() => !isTalisman && setModalOpen(type)}
                    className={`flex items-center p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                      isTalisman
                        ? "cursor-not-allowed opacity-50"
                        : darkMode
                        ? "border-slate-600 hover:border-cyan-500 hover:bg-slate-700/50"
                        : "border-gray-300 hover:border-amber-500 hover:bg-amber-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                        darkMode ? "bg-slate-700" : "bg-gray-100"
                      }`}
                    >
                      <IconComponent />
                    </div>
                    <div className="flex-1">
                      {equipment ? (
                        <div>
                          <div
                            className={`font-medium ${
                              darkMode ? "text-amber-100" : "text-gray-900"
                            }`}
                          >
                            {equipment.data.name}
                          </div>
                          <div
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {isWeapon
                              ? equipment.data.skills
                                  ?.map(([n, l]) => `${n} Lv.${l}`)
                                  .join(", ") || "—"
                              : equipment.data.skills
                                  ?.map((s) => `${s.name} Lv.${s.level}`)
                                  .join(", ") || "—"}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {getUIText(label, language)}
                        </div>
                      )}
                    </div>
                    {/* Slots de l'équipement */}
                    <div className="flex items-center gap-2">
                      {equipment
                        ? renderSlots(equipment.data.slots, darkMode)
                        : (
                          <div className="flex gap-1">
                            <span className="w-5 h-5 rounded-full bg-gray-600/50"></span>
                            <span className="w-5 h-5 rounded-full bg-gray-600/50"></span>
                            <span className="w-5 h-5 rounded-full bg-gray-600/50"></span>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats totales */}
            <div
              className={`mt-6 pt-6 border-t ${
                darkMode ? "border-slate-600" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {getUIText("totalDefense", language)}:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        darkMode ? "text-amber-100" : "text-gray-900"
                      }`}
                    >
                      🛡️ {totalDefense}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {getUIText("slots", language)}:
                    </span>
                    {totalSlots.length > 0 ? (
                      renderSlots(totalSlots, darkMode)
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite : Talents cumulés */}
        <div>
          <div
            className={`rounded-xl p-6 sticky top-4 ${
              darkMode ? "bg-slate-800/50" : "bg-white/80"
            }`}
          >
            <h3
              className={`text-lg font-bold mb-4 ${
                darkMode ? "text-amber-100" : "text-gray-900"
              }`}
            >
              {getUIText("talents", language)}
            </h3>

            {totalSkills.length === 0 ? (
              <div
                className={`text-center py-8 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {getUIText("none", language)}
              </div>
            ) : (
              <div className="space-y-3">
                {totalSkills.map((skill, index) => {
                  // Trouver le niveau max du talent dans talentsData
                  const talentKey = Object.keys(talentsData).find((key) => {
                    const talent = talentsData[key];
                    return availableLanguages.some(
                      (lang) =>
                        talent[lang]?.name?.toLowerCase() ===
                        skill.name.toLowerCase()
                    );
                  });
                  const talentInfo = talentKey ? talentsData[talentKey] : null;
                  const maxLevel = talentInfo
                    ? Math.max(
                        ...Object.keys(
                          talentInfo[language]?.levels ||
                            talentInfo.EN?.levels ||
                            {}
                        ).map((l) => parseInt(l.replace(/\D/g, "")) || 0)
                      )
                    : 7;

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? "bg-slate-700/50" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            darkMode ? "text-amber-100" : "text-gray-900"
                          }`}
                        >
                          {skill.name}
                        </div>
                        {/* Barre de progression */}
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: maxLevel || 7 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-4 h-2 rounded-sm ${
                                i < skill.level
                                  ? darkMode
                                    ? "bg-cyan-500"
                                    : "bg-amber-500"
                                  : darkMode
                                  ? "bg-slate-600"
                                  : "bg-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span
                        className={`font-bold text-lg ${
                          darkMode ? "text-cyan-400" : "text-amber-600"
                        }`}
                      >
                        Lv.{skill.level}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de sélection */}
      <EquipmentSelectionModal
        isOpen={modalOpen !== null}
        onClose={() => setModalOpen(null)}
        type={modalOpen}
        onSelect={(item) => handleSelect(modalOpen, item)}
        darkMode={darkMode}
        language={language}
        availableLanguages={availableLanguages}
      />

      {/* Modal des builds sauvegardés */}
      {showSavedBuildsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col ${
              darkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b flex items-center justify-between ${
                darkMode ? "border-slate-700" : "border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-amber-100" : "text-gray-900"
                }`}
              >
                {getUIText("savedBuilds", language)}
              </h2>
              <button
                onClick={() => setShowSavedBuildsModal(false)}
                className={`p-2 rounded-full transition-colors ${
                  darkMode
                    ? "hover:bg-slate-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Liste des builds */}
            <div className="flex-1 overflow-y-auto p-4">
              {savedBuilds.length === 0 ? (
                <div
                  className={`text-center py-12 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <ListIcon />
                  <p className="mt-4">{getUIText("noSavedBuilds", language)}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedBuilds.map((build) => (
                    <div
                      key={build.id}
                      className={`p-4 rounded-lg transition-colors ${
                        darkMode
                          ? "bg-slate-800 hover:bg-slate-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          {editingBuildId === build.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingBuildName}
                                onChange={(e) => setEditingBuildName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveRename(build.id);
                                  if (e.key === "Escape") {
                                    setEditingBuildId(null);
                                    setEditingBuildName("");
                                  }
                                }}
                                autoFocus
                                className={`flex-1 px-2 py-1 rounded border focus:outline-none focus:ring-2 ${
                                  darkMode
                                    ? "bg-slate-700 border-slate-600 text-amber-100 focus:ring-cyan-500"
                                    : "bg-white border-gray-300 text-gray-900 focus:ring-amber-500"
                                }`}
                              />
                              <button
                                onClick={() => handleSaveRename(build.id)}
                                className={`p-1 rounded ${
                                  darkMode
                                    ? "bg-green-900/50 text-green-300 hover:bg-green-800/50"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                              >
                                <CheckIcon />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingBuildId(null);
                                  setEditingBuildName("");
                                }}
                                className={`p-1 rounded ${
                                  darkMode
                                    ? "bg-red-900/50 text-red-300 hover:bg-red-800/50"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                              >
                                <CloseIcon />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div
                                className={`font-medium truncate ${
                                  darkMode ? "text-amber-100" : "text-gray-900"
                                }`}
                              >
                                {build.name}
                              </div>
                              <div
                                className={`text-xs mt-1 ${
                                  darkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              >
                                {new Date(build.createdAt).toLocaleDateString()} • {build.language}
                              </div>
                            </>
                          )}
                        </div>
                        
                        {editingBuildId !== build.id && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleLoadBuild(build)}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                darkMode
                                  ? "bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/50"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              {getUIText("load", language)}
                            </button>
                            <button
                              onClick={() => handleRenameBuild(build.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                darkMode
                                  ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                              }`}
                              title={getUIText("rename", language)}
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => handleDeleteBuild(build.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                darkMode
                                  ? "bg-red-900/50 text-red-300 hover:bg-red-800/50"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                              title={getUIText("delete", language)}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`p-4 border-t ${
                darkMode ? "border-slate-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => setShowSavedBuildsModal(false)}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {getUIText("close", language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deletingBuildId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-md ${
              darkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b flex items-center gap-3 ${
                darkMode ? "border-slate-700" : "border-gray-200"
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  darkMode ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
                }`}
              >
                <TrashIcon />
              </div>
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-amber-100" : "text-gray-900"
                }`}
              >
                {getUIText("deleteConfirmTitle", language)}
              </h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p
                className={`text-center ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {getUIText("confirmDelete", language)}
              </p>
              {/* Afficher le nom du build à supprimer */}
              {(() => {
                const buildToDelete = savedBuilds.find((b) => b.id === deletingBuildId);
                return buildToDelete ? (
                  <p
                    className={`text-center mt-3 font-semibold ${
                      darkMode ? "text-amber-200" : "text-gray-900"
                    }`}
                  >
                    &quot;{buildToDelete.name}&quot;
                  </p>
                ) : null;
              })()}
            </div>

            {/* Actions */}
            <div
              className={`p-4 border-t flex gap-3 ${
                darkMode ? "border-slate-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => setDeletingBuildId(null)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {getUIText("cancel", language)}
              </button>
              <button
                onClick={confirmDeleteBuild}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? "bg-red-900/70 text-red-200 hover:bg-red-800/70"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {getUIText("delete", language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
