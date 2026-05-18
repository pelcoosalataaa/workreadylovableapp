import { Hammer, Circle, Grid3x3, Wrench, type LucideIcon } from "lucide-react";

export type DepartmentValue =
  | "snickeri"
  | "gul-hallen"
  | "rosa-hallen"
  | "grona-hallen"
  | "armering"
  | "lap-och-lag";

export type Department = {
  value: DepartmentValue;
  name: string;
  sub: string;
  icon: LucideIcon;
  iconColor: string;
  headerTitle: string;
};

export const DEPARTMENTS: Department[] = [
  {
    value: "snickeri",
    name: "Snickeriavdelning / Formbyggnad",
    sub: "Formsnickning, träformar, utsparingar",
    icon: Hammer,
    iconColor: "#7dedb8",
    headerTitle: "Snickeriavdelning / Formbyggnad · Ucklum",
  },
  {
    value: "gul-hallen",
    name: "Gul hallen",
    sub: "Gjutning, betongarbete, vibrering",
    icon: Circle,
    iconColor: "#ffd166",
    headerTitle: "Gul hallen · Gjutavdelning · Ucklum",
  },
  {
    value: "rosa-hallen",
    name: "Rosa hallen",
    sub: "Gjutning, betongarbete, vibrering",
    icon: Circle,
    iconColor: "#ff9fb0",
    headerTitle: "Rosa hallen · Gjutavdelning · Ucklum",
  },
  {
    value: "grona-hallen",
    name: "Gröna hallen",
    sub: "Gjutning, betongarbete, vibrering",
    icon: Circle,
    iconColor: "#00e096",
    headerTitle: "Gröna hallen · Gjutavdelning · Ucklum",
  },
  {
    value: "armering",
    name: "Armeringsavdelning",
    sub: "Armering, svetsteknik, kranlyft",
    icon: Grid3x3,
    iconColor: "#60b0f4",
    headerTitle: "Armeringsavdelning · Ucklum",
  },
  {
    value: "lap-och-lag",
    name: "Lap och Lag",
    sub: "Lagning, ytbehandling, kvalitetskontroll",
    icon: Wrench,
    iconColor: "#ff4d6a",
    headerTitle: "Lap och Lag · Ytbehandling & Lagning · Ucklum",
  },
];

export type ChecklistItem = { title: string; desc: string };
export type ChecklistWeek = { week: string; items: ChecklistItem[] };

const snickeri: ChecklistWeek[] = [
  {
    week: "Vecka 1 — Grundläggande säkerhet",
    items: [
      { title: "Skyddsutrustning för träarbete", desc: "Hörselskydd, skyddsglasögon och handskar ska alltid bäras vid maskinarbete i snickeriavdelningen." },
      { title: "Säker hantering av spikpistol", desc: "Genomgång av spikpistolers funktion, laddning, säkringsgrepp och nödstopp. Öva aldrig på lösa material." },
      { title: "Nödstoppsposition — trämaskiner", desc: "Identifiera och memorera placeringen av nödstopp på cirkelsåg, bandsåg och hyvelmaskiner." },
    ],
  },
  {
    week: "Vecka 2 — Ritningsläsning",
    items: [
      { title: "Läsa formbyggnadsritningar", desc: "Förstå planritning, sektioner och detaljritningar för träformar. Identifiera mått, toleranser och materialval." },
      { title: "Identifiera utsparingsblock", desc: "Lär dig identifiera och placera utsparingsblock (el, VVS, fönster) exakt enligt ritning. Kontrollera alltid två gånger." },
      { title: "Kontroll av formens räthet", desc: "Använd vattenpass och måttband för att verifiera att formen är rak, lodrät och att diagonalerna stämmer." },
    ],
  },
  {
    week: "Vecka 3 — Praktiskt arbete",
    items: [
      { title: "Bygga grundform — praktik", desc: "Under handledning: bygg en komplett form för en standardpanel. Chefen signerar när godkänd." },
      { title: "Fästa och säkra formdelar", desc: "Korrekt användning av formspännen, stöttor och dragstänger. Kontrollera att allt är åtdraget innan gjutning." },
      { title: "Städ och återställ arbetsplats", desc: "Sortera träavfall, rengör maskiner och återlämna verktyg efter varje arbetspass." },
    ],
  },
];

const gjutning: ChecklistWeek[] = [
  {
    week: "Vecka 1 — Säkerhet och introduktion",
    items: [
      { title: "Skyddsutrustning i gjuthallen", desc: "Skyddshjälm, skyddsglasögon, handskar och stålhättade skor är obligatoriska. Betong är frätande — undvik hudkontakt." },
      { title: "Nödlägesberedskap i hallen", desc: "Identifiera brandsläckare, första hjälpen-kit, nödutrymningsvägar och kranoperatörens nödstopp." },
      { title: "Kommunikation med kranoperatör", desc: "Lär dig handsignalerna för lyft, stopp, sänk och nödstopp. Ögonkontakt krävs alltid innan lyft påbörjas." },
    ],
  },
  {
    week: "Vecka 2 — Gjutningsprocess",
    items: [
      { title: "Förberedelse av gjutform", desc: "Kontrollera att formen är ren, olja applicerad, utsparingsblock på plats och att armeringen är fixerad." },
      { title: "Betongpåfyllning och fördelning", desc: "Fyll formen i lager om max 30 cm. Fördela betongen jämnt med spade — undvik ansamlingar." },
      { title: "Användning av vibrator", desc: "Sätt ner vibratorn vertikalt med 30-40 cm mellanrum. Håll ca 5 sek per punkt. Ta inte i armeringen med vibratorn." },
    ],
  },
  {
    week: "Vecka 3 — Härdning och kvalitet",
    items: [
      { title: "Härdningstider och täckning", desc: "Täck gjutet element med plastfolie direkt efter gjutning. Kontrollera härdningsschema för aktuell betongkvalitet." },
      { title: "Kontroll före avtäckning", desc: "Verifiera härdningstid, yttemperatur och att inga synliga sprickor finns innan formen öppnas." },
      { title: "Lyft och transport av element", desc: "Kontrollera att lyftöglor är korrekt placerade. Samordna med kranoperatör. Inga personer under hängande last." },
    ],
  },
];

const armering: ChecklistWeek[] = [
  {
    week: "Vecka 1 — Säkerhet",
    items: [
      { title: "Skyddsutrustning för armeringsarbete", desc: "Handskar mot skärskador, skyddsglasögon vid kapning, skyddshjälm och stålhättade skor är obligatoriska." },
      { title: "Säker hantering av armeringsjärn", desc: "Bär alltid handskar. Skydda ändarna med kåpor. Stapla järn stabilt och max 1 meter högt utan stöd." },
      { title: "Kranskyddsregler", desc: "Stå aldrig under hängande last. Ge signal till operatören — vänta på bekräftelse. Använd styrlinor vid behov." },
    ],
  },
  {
    week: "Vecka 2 — Ritningsläsning",
    items: [
      { title: "Läsa armeringsritningar", desc: "Förstå beteckningar för järndimensioner, bockningsmått, täckskikt och placeringsavstånd i ritningen." },
      { title: "Kontrollera täckskikt", desc: "Mät och verifiera att täckskiktsavstånd stämmer med ritning. Använd rätt avståndshållare för aktuell miljöklass." },
      { title: "Identifiera järntyper och bockar", desc: "Lär dig skilja på nätarmering, lösarmering och byglar. Kontrollera att bockningar matchar ritningsdetaljer." },
    ],
  },
  {
    week: "Vecka 3 — Praktiskt arbete",
    items: [
      { title: "Placering och bindning av armering", desc: "Placera järn enligt ritning. Bind korsningspunkter med bindtråd eller svets — kontrollera att inget glider vid gjutning." },
      { title: "Svetssäkerhet — grundkurs", desc: "Kontrollera att du har godkänt svetsintyg. Använd svetsSkärm, handskar och rätt elektrod. Aldrig svetsa utan ventilation." },
      { title: "Signering av färdig armering", desc: "Kontrollanta signerar armeringsprotokoll innan gjutning. Säkerställ att dokumentationen är komplett." },
    ],
  },
];

const lapOchLag: ChecklistWeek[] = [
  {
    week: "Vecka 1 — Säkerhet och material",
    items: [
      { title: "Skyddsutrustning för lagningsarbete", desc: "Andningsskydd (P2 eller P3) vid slipning, skyddsglasögon, kemresistenta handskar och knäskydd för arbete nära golv." },
      { title: "Hantering av lagningsmassa och kemikalier", desc: "Läs säkerhetsdatablad för aktuell produkt. Undvik inandning av damm och hudkontakt. Förvara kemikalier svalt." },
      { title: "Ventilation vid inomhuslagning", desc: "Kontrollera att ventilationen är tillräcklig. Vid slipning eller lösningsmedel — öppna portar och använd fläkt." },
    ],
  },
  {
    week: "Vecka 2 — Ytkvalitet och krav",
    items: [
      { title: "Identifiera sprickor och defekter", desc: "Lär dig bedöma sprickors typ (ytspricka, genomgående, krympspricka) och rätt åtgärd för varje. Dokumentera med foto." },
      { title: "Ytkrav och toleranser", desc: "Förstå krav på ytjämnhet (rätskiva 3 mm / 2 m), färgmatchning och tillåtna ojämnheter för exponerade betongvytor." },
      { title: "Bedömning av lagningsbehovet", desc: "Avgör om defekten kräver ytlagning, injektering eller byte av element. Kontakta kvalitetsansvarig vid tveksamhet." },
    ],
  },
  {
    week: "Vecka 3 — Praktiskt lagningsarbete",
    items: [
      { title: "Förbehandling av yta", desc: "Rengör skadad yta mekaniskt (stålborste, högtryck). Ta bort löst material. Fukta underlaget innan applicering." },
      { title: "Applicering av lagningsmassa", desc: "Applicera i lager om max 10 mm. Arbeta in i kanter. Avjämna med spackel. Kontrollera att inga luftbubblor finns." },
      { title: "Efterbehandling och kvalitetskontroll", desc: "Skydda lagad yta från uttorkning (täck eller fukta). Kontrollera efter härdning att ytan uppfyller krav. Fotografera och dokumentera." },
    ],
  },
];

export const CHECKLISTS: Record<DepartmentValue, ChecklistWeek[]> = {
  "snickeri": snickeri,
  "gul-hallen": gjutning,
  "rosa-hallen": gjutning,
  "grona-hallen": gjutning,
  "armering": armering,
  "lap-och-lag": lapOchLag,
};

export function getDepartment(value: string | null | undefined): Department | undefined {
  return DEPARTMENTS.find((d) => d.value === value);
}

export const STORAGE_KEY = "vald_avdelning";
export const checklistKey = (dept: DepartmentValue, idx: number) => `checklist_${dept}_${idx}`;
