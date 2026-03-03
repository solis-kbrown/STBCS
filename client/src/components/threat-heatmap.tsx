import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, Users, AlertTriangle } from "lucide-react";

interface CountryData {
  name: string;
  count: number;
}

interface GroupData {
  name: string;
  victims: number;
}

interface ThreatHeatmapProps {
  topCountries: CountryData[];
  topGroups?: GroupData[];
  onCountryClick?: (country: string) => void;
}

const COUNTRY_NAME_MAP: Record<string, string[]> = {
  US: ["United States", "USA", "US", "United States of America"],
  GB: ["United Kingdom", "UK", "Great Britain", "England", "GB"],
  DE: ["Germany", "DE"],
  FR: ["France", "FR"],
  IT: ["Italy", "IT"],
  ES: ["Spain", "ES"],
  CA: ["Canada", "CA"],
  AU: ["Australia", "AU"],
  BR: ["Brazil", "BR"],
  IN: ["India", "IN"],
  CN: ["China", "CN"],
  JP: ["Japan", "JP"],
  KR: ["South Korea", "Korea", "KR"],
  RU: ["Russia", "Russian Federation", "RU"],
  MX: ["Mexico", "MX"],
  AR: ["Argentina", "AR"],
  CL: ["Chile", "CL"],
  CO: ["Colombia", "CO"],
  PE: ["Peru", "PE"],
  ZA: ["South Africa", "ZA"],
  NG: ["Nigeria", "NG"],
  EG: ["Egypt", "EG"],
  KE: ["Kenya", "KE"],
  SE: ["Sweden", "SE"],
  NO: ["Norway", "NO"],
  FI: ["Finland", "FI"],
  DK: ["Denmark", "DK"],
  NL: ["Netherlands", "NL", "Holland"],
  BE: ["Belgium", "BE"],
  AT: ["Austria", "AT"],
  CH: ["Switzerland", "CH"],
  PL: ["Poland", "PL"],
  CZ: ["Czech Republic", "Czechia", "CZ"],
  PT: ["Portugal", "PT"],
  IE: ["Ireland", "IE"],
  IL: ["Israel", "IL"],
  AE: ["United Arab Emirates", "UAE", "AE"],
  SA: ["Saudi Arabia", "SA"],
  TR: ["Turkey", "Türkiye", "TR"],
  TH: ["Thailand", "TH"],
  SG: ["Singapore", "SG"],
  MY: ["Malaysia", "MY"],
  ID: ["Indonesia", "ID"],
  PH: ["Philippines", "PH"],
  VN: ["Vietnam", "VN"],
  TW: ["Taiwan", "TW"],
  NZ: ["New Zealand", "NZ"],
  PK: ["Pakistan", "PK"],
  BD: ["Bangladesh", "BD"],
  UA: ["Ukraine", "UA"],
  RO: ["Romania", "RO"],
  HU: ["Hungary", "HU"],
  GR: ["Greece", "GR"],
  HR: ["Croatia", "HR"],
  BG: ["Bulgaria", "BG"],
  SK: ["Slovakia", "SK"],
  SI: ["Slovenia", "SI"],
  LT: ["Lithuania", "LT"],
  LV: ["Latvia", "LV"],
  EE: ["Estonia", "EE"],
  RS: ["Serbia", "RS"],
  CY: ["Cyprus", "CY"],
  LU: ["Luxembourg", "LU"],
  MT: ["Malta", "MT"],
  IS: ["Iceland", "IS"],
  MA: ["Morocco", "MA"],
  TN: ["Tunisia", "TN"],
  GH: ["Ghana", "GH"],
  QA: ["Qatar", "QA"],
  KW: ["Kuwait", "KW"],
  BH: ["Bahrain", "BH"],
  OM: ["Oman", "OM"],
  JO: ["Jordan", "JO"],
  LB: ["Lebanon", "LB"],
  VE: ["Venezuela", "VE"],
  EC: ["Ecuador", "EC"],
  UY: ["Uruguay", "UY"],
  PY: ["Paraguay", "PY"],
  BO: ["Bolivia", "BO"],
  CR: ["Costa Rica", "CR"],
  PA: ["Panama", "PA"],
  DO: ["Dominican Republic", "DO"],
  GT: ["Guatemala", "GT"],
  HN: ["Honduras", "HN"],
  SV: ["El Salvador", "SV"],
  NI: ["Nicaragua", "NI"],
  JM: ["Jamaica", "JM"],
  TT: ["Trinidad and Tobago", "TT"],
  MM: ["Myanmar", "MM"],
  KH: ["Cambodia", "KH"],
  LA: ["Laos", "LA"],
  LK: ["Sri Lanka", "LK"],
  NP: ["Nepal", "NP"],
  KZ: ["Kazakhstan", "KZ"],
  UZ: ["Uzbekistan", "UZ"],
  GE: ["Georgia", "GE"],
  AM: ["Armenia", "AM"],
  AZ: ["Azerbaijan", "AZ"],
  IQ: ["Iraq", "IQ"],
  IR: ["Iran", "IR"],
  AF: ["Afghanistan", "AF"],
  DZ: ["Algeria", "DZ"],
  LY: ["Libya", "LY"],
  SD: ["Sudan", "SD"],
  ET: ["Ethiopia", "ET"],
  TZ: ["Tanzania", "TZ"],
  UG: ["Uganda", "UG"],
  MZ: ["Mozambique", "MZ"],
  MG: ["Madagascar", "MG"],
  AO: ["Angola", "AO"],
  CD: ["DR Congo", "Congo", "CD"],
  CM: ["Cameroon", "CM"],
  CI: ["Ivory Coast", "Côte d'Ivoire", "CI"],
  SN: ["Senegal", "SN"],
  ML: ["Mali", "ML"],
  BF: ["Burkina Faso", "BF"],
  NE: ["Niger", "NE"],
  TD: ["Chad", "TD"],
  MN: ["Mongolia", "MN"],
  BY: ["Belarus", "BY"],
  MD: ["Moldova", "MD"],
  BA: ["Bosnia and Herzegovina", "Bosnia", "BA"],
  AL: ["Albania", "AL"],
  ME: ["Montenegro", "ME"],
  MK: ["North Macedonia", "Macedonia", "MK"],
  XK: ["Kosovo", "XK"],
};

const COUNTRY_PATHS: Record<string, { d: string; label: string }> = {
  US: {
    d: "M 55,135 L 60,130 L 68,128 L 75,125 L 82,120 L 90,118 L 98,120 L 105,125 L 110,130 L 118,132 L 125,130 L 130,128 L 138,126 L 145,128 L 150,130 L 155,133 L 158,138 L 156,142 L 152,146 L 148,148 L 142,150 L 135,149 L 128,148 L 120,150 L 112,152 L 105,150 L 98,148 L 90,145 L 82,142 L 75,140 L 68,138 L 60,138 Z",
    label: "United States",
  },
  CA: {
    d: "M 55,100 L 62,95 L 70,90 L 80,88 L 90,85 L 100,80 L 110,78 L 120,80 L 130,82 L 140,85 L 148,90 L 155,95 L 158,100 L 160,108 L 158,115 L 155,120 L 150,125 L 145,128 L 138,126 L 130,128 L 125,130 L 118,132 L 110,130 L 105,125 L 98,120 L 90,118 L 82,120 L 75,125 L 68,128 L 60,130 L 55,135 L 50,130 L 48,120 L 50,110 L 52,105 Z",
    label: "Canada",
  },
  MX: {
    d: "M 68,148 L 75,150 L 82,152 L 88,156 L 95,160 L 100,165 L 105,170 L 108,175 L 106,180 L 100,182 L 94,180 L 88,176 L 82,172 L 76,168 L 70,164 L 66,158 L 64,152 Z",
    label: "Mexico",
  },
  BR: {
    d: "M 145,210 L 155,205 L 165,200 L 175,198 L 182,202 L 188,208 L 190,215 L 192,225 L 190,235 L 185,245 L 178,252 L 170,258 L 162,260 L 155,258 L 148,252 L 142,245 L 138,238 L 136,228 L 138,218 Z",
    label: "Brazil",
  },
  AR: {
    d: "M 130,260 L 138,255 L 145,258 L 150,262 L 152,270 L 150,280 L 148,290 L 145,300 L 140,308 L 135,315 L 130,310 L 128,300 L 126,290 L 125,280 L 126,270 Z",
    label: "Argentina",
  },
  CL: {
    d: "M 120,265 L 125,260 L 128,268 L 126,278 L 124,288 L 122,298 L 120,308 L 118,315 L 115,310 L 116,300 L 118,290 L 119,280 L 119,270 Z",
    label: "Chile",
  },
  CO: {
    d: "M 115,185 L 122,182 L 130,180 L 138,182 L 142,188 L 140,195 L 135,200 L 128,202 L 120,200 L 115,195 Z",
    label: "Colombia",
  },
  PE: {
    d: "M 110,205 L 118,200 L 126,202 L 132,208 L 130,218 L 126,225 L 120,230 L 112,228 L 108,220 L 108,212 Z",
    label: "Peru",
  },
  VE: {
    d: "M 128,175 L 138,172 L 148,175 L 152,180 L 148,186 L 140,188 L 132,185 L 128,180 Z",
    label: "Venezuela",
  },
  GB: {
    d: "M 270,105 L 274,100 L 278,98 L 282,100 L 284,105 L 282,110 L 278,114 L 274,112 L 270,110 Z",
    label: "United Kingdom",
  },
  IE: {
    d: "M 264,104 L 268,100 L 272,102 L 272,108 L 268,110 L 264,108 Z",
    label: "Ireland",
  },
  FR: {
    d: "M 275,118 L 282,115 L 290,116 L 296,120 L 298,126 L 294,132 L 288,134 L 280,132 L 275,128 L 273,122 Z",
    label: "France",
  },
  DE: {
    d: "M 295,105 L 302,102 L 310,104 L 314,110 L 312,118 L 308,122 L 300,120 L 295,115 L 293,110 Z",
    label: "Germany",
  },
  ES: {
    d: "M 262,132 L 270,128 L 280,130 L 288,134 L 286,140 L 280,144 L 272,144 L 265,142 L 260,138 Z",
    label: "Spain",
  },
  PT: {
    d: "M 255,132 L 260,128 L 264,132 L 264,140 L 260,144 L 255,140 Z",
    label: "Portugal",
  },
  IT: {
    d: "M 300,125 L 306,122 L 312,125 L 314,132 L 312,140 L 308,148 L 304,152 L 300,148 L 298,140 L 298,132 Z",
    label: "Italy",
  },
  NL: {
    d: "M 288,102 L 294,100 L 298,103 L 296,108 L 292,110 L 288,107 Z",
    label: "Netherlands",
  },
  BE: {
    d: "M 286,110 L 292,108 L 296,110 L 296,115 L 292,116 L 286,114 Z",
    label: "Belgium",
  },
  CH: {
    d: "M 292,120 L 298,118 L 304,120 L 304,124 L 300,126 L 294,124 Z",
    label: "Switzerland",
  },
  AT: {
    d: "M 305,116 L 312,114 L 320,116 L 322,120 L 318,124 L 310,122 L 306,120 Z",
    label: "Austria",
  },
  SE: {
    d: "M 305,72 L 310,68 L 316,70 L 318,78 L 316,88 L 312,95 L 308,98 L 304,92 L 302,82 Z",
    label: "Sweden",
  },
  NO: {
    d: "M 295,68 L 302,62 L 308,65 L 310,72 L 306,80 L 302,88 L 298,92 L 294,85 L 292,78 Z",
    label: "Norway",
  },
  FI: {
    d: "M 318,68 L 324,62 L 330,65 L 334,72 L 332,82 L 328,90 L 322,94 L 318,88 L 316,78 Z",
    label: "Finland",
  },
  DK: {
    d: "M 296,96 L 302,94 L 306,96 L 306,102 L 302,104 L 298,102 Z",
    label: "Denmark",
  },
  PL: {
    d: "M 315,102 L 324,100 L 332,102 L 336,108 L 334,114 L 328,116 L 320,114 L 315,110 Z",
    label: "Poland",
  },
  CZ: {
    d: "M 310,112 L 318,110 L 324,112 L 326,116 L 322,120 L 316,118 L 312,116 Z",
    label: "Czech Republic",
  },
  SK: {
    d: "M 324,112 L 332,110 L 338,114 L 336,118 L 330,120 L 326,116 Z",
    label: "Slovakia",
  },
  HU: {
    d: "M 320,120 L 328,118 L 336,120 L 338,126 L 332,128 L 324,126 Z",
    label: "Hungary",
  },
  RO: {
    d: "M 335,120 L 345,118 L 352,122 L 354,128 L 350,134 L 342,132 L 336,128 Z",
    label: "Romania",
  },
  BG: {
    d: "M 340,132 L 348,130 L 354,134 L 354,140 L 348,142 L 342,140 Z",
    label: "Bulgaria",
  },
  GR: {
    d: "M 332,140 L 340,138 L 346,142 L 348,148 L 344,154 L 338,152 L 334,148 Z",
    label: "Greece",
  },
  TR: {
    d: "M 348,130 L 358,125 L 370,122 L 382,125 L 390,130 L 388,136 L 380,140 L 370,142 L 358,140 L 350,138 Z",
    label: "Turkey",
  },
  UA: {
    d: "M 338,105 L 350,102 L 362,104 L 370,108 L 372,114 L 368,120 L 358,122 L 348,120 L 340,116 L 336,110 Z",
    label: "Ukraine",
  },
  RU: {
    d: "M 340,60 L 360,52 L 390,48 L 420,42 L 460,38 L 500,35 L 540,38 L 570,42 L 590,50 L 600,58 L 610,68 L 605,80 L 595,88 L 580,95 L 560,98 L 540,100 L 520,98 L 500,95 L 480,90 L 460,88 L 440,85 L 420,82 L 400,85 L 385,90 L 375,95 L 370,100 L 372,108 L 368,114 L 362,104 L 350,102 L 340,105 L 336,100 L 338,90 L 340,78 L 342,68 Z",
    label: "Russia",
  },
  CN: {
    d: "M 480,120 L 500,115 L 520,112 L 540,115 L 555,120 L 565,128 L 570,138 L 568,148 L 560,155 L 548,158 L 535,160 L 520,158 L 505,155 L 495,148 L 488,140 L 482,132 Z",
    label: "China",
  },
  JP: {
    d: "M 580,125 L 586,120 L 592,122 L 596,128 L 594,136 L 590,142 L 584,148 L 580,144 L 578,136 L 578,130 Z",
    label: "Japan",
  },
  KR: {
    d: "M 568,130 L 574,126 L 578,130 L 578,138 L 574,142 L 570,138 Z",
    label: "South Korea",
  },
  IN: {
    d: "M 450,155 L 465,148 L 480,150 L 492,155 L 498,165 L 500,178 L 495,190 L 485,200 L 475,205 L 465,200 L 458,190 L 452,178 L 448,168 Z",
    label: "India",
  },
  PK: {
    d: "M 435,140 L 448,135 L 458,138 L 465,145 L 462,152 L 455,158 L 445,155 L 438,150 Z",
    label: "Pakistan",
  },
  SA: {
    d: "M 370,155 L 382,150 L 395,148 L 405,152 L 410,160 L 408,170 L 400,178 L 390,180 L 380,176 L 372,168 Z",
    label: "Saudi Arabia",
  },
  AE: {
    d: "M 408,165 L 415,162 L 420,166 L 418,172 L 412,174 L 408,170 Z",
    label: "UAE",
  },
  IL: {
    d: "M 362,148 L 366,144 L 370,148 L 370,156 L 366,158 L 362,154 Z",
    label: "Israel",
  },
  IR: {
    d: "M 395,130 L 410,125 L 425,128 L 435,135 L 438,145 L 432,155 L 420,158 L 408,155 L 398,148 L 392,140 Z",
    label: "Iran",
  },
  IQ: {
    d: "M 375,138 L 386,134 L 396,138 L 398,146 L 392,152 L 382,150 L 376,146 Z",
    label: "Iraq",
  },
  EG: {
    d: "M 345,160 L 355,155 L 365,158 L 368,165 L 365,175 L 358,180 L 348,178 L 342,172 Z",
    label: "Egypt",
  },
  NG: {
    d: "M 290,195 L 300,190 L 310,192 L 316,198 L 314,206 L 306,210 L 296,208 L 290,202 Z",
    label: "Nigeria",
  },
  ZA: {
    d: "M 340,270 L 352,265 L 362,268 L 368,275 L 365,285 L 358,290 L 348,292 L 340,288 L 336,280 Z",
    label: "South Africa",
  },
  KE: {
    d: "M 370,210 L 378,206 L 384,210 L 386,218 L 382,224 L 375,226 L 370,220 Z",
    label: "Kenya",
  },
  AU: {
    d: "M 510,255 L 530,248 L 550,245 L 570,248 L 585,255 L 592,265 L 590,278 L 582,288 L 568,295 L 550,298 L 532,295 L 518,288 L 510,278 L 508,268 Z",
    label: "Australia",
  },
  NZ: {
    d: "M 600,290 L 608,285 L 614,288 L 616,296 L 612,304 L 606,308 L 600,304 L 598,296 Z",
    label: "New Zealand",
  },
  ID: {
    d: "M 520,200 L 535,196 L 550,198 L 562,202 L 570,208 L 568,215 L 558,218 L 545,220 L 530,218 L 520,212 Z",
    label: "Indonesia",
  },
  TH: {
    d: "M 505,170 L 512,165 L 518,168 L 520,176 L 516,184 L 510,188 L 505,182 Z",
    label: "Thailand",
  },
  MY: {
    d: "M 512,192 L 520,188 L 528,190 L 530,196 L 525,200 L 518,198 Z",
    label: "Malaysia",
  },
  SG: {
    d: "M 518,200 L 522,198 L 524,202 L 520,204 Z",
    label: "Singapore",
  },
  PH: {
    d: "M 548,170 L 555,166 L 560,170 L 562,178 L 558,186 L 552,188 L 548,182 Z",
    label: "Philippines",
  },
  VN: {
    d: "M 525,165 L 532,160 L 538,164 L 540,172 L 536,180 L 530,184 L 525,178 Z",
    label: "Vietnam",
  },
  TW: {
    d: "M 558,152 L 563,148 L 566,152 L 564,158 L 560,160 Z",
    label: "Taiwan",
  },
  DZ: {
    d: "M 275,155 L 288,150 L 300,152 L 308,158 L 306,168 L 298,174 L 286,176 L 276,172 L 272,164 Z",
    label: "Algeria",
  },
  MA: {
    d: "M 260,148 L 270,144 L 278,148 L 278,156 L 272,160 L 264,158 Z",
    label: "Morocco",
  },
  LY: {
    d: "M 308,155 L 322,152 L 335,155 L 340,162 L 338,172 L 330,178 L 318,180 L 308,175 L 304,165 Z",
    label: "Libya",
  },
  SD: {
    d: "M 348,180 L 362,176 L 370,182 L 372,192 L 368,200 L 358,205 L 348,202 L 344,192 Z",
    label: "Sudan",
  },
  ET: {
    d: "M 370,195 L 382,190 L 392,194 L 394,204 L 388,212 L 378,214 L 370,208 Z",
    label: "Ethiopia",
  },
  CD: {
    d: "M 330,215 L 345,210 L 358,214 L 362,224 L 356,234 L 345,238 L 334,234 L 328,225 Z",
    label: "DR Congo",
  },
  AO: {
    d: "M 315,235 L 328,230 L 338,234 L 340,244 L 334,252 L 324,254 L 316,248 Z",
    label: "Angola",
  },
  TZ: {
    d: "M 362,225 L 374,220 L 382,225 L 384,235 L 378,242 L 368,244 L 362,238 Z",
    label: "Tanzania",
  },
  MZ: {
    d: "M 370,248 L 380,244 L 386,250 L 388,260 L 384,270 L 376,274 L 370,266 Z",
    label: "Mozambique",
  },
  MG: {
    d: "M 395,260 L 402,255 L 408,260 L 408,272 L 404,280 L 398,278 L 394,270 Z",
    label: "Madagascar",
  },
  CM: {
    d: "M 305,200 L 315,196 L 322,200 L 324,210 L 318,216 L 308,214 Z",
    label: "Cameroon",
  },
  GH: {
    d: "M 278,195 L 286,192 L 292,196 L 290,204 L 284,208 L 278,202 Z",
    label: "Ghana",
  },
  CI: {
    d: "M 268,195 L 276,192 L 282,196 L 280,204 L 274,208 L 268,202 Z",
    label: "Ivory Coast",
  },
  SN: {
    d: "M 248,188 L 258,185 L 264,190 L 262,196 L 255,198 L 248,194 Z",
    label: "Senegal",
  },
  KZ: {
    d: "M 400,90 L 420,85 L 445,82 L 465,85 L 478,92 L 480,102 L 475,112 L 462,118 L 445,120 L 428,118 L 412,112 L 402,105 L 398,98 Z",
    label: "Kazakhstan",
  },
  AF: {
    d: "M 435,128 L 448,124 L 458,128 L 460,136 L 455,142 L 445,144 L 438,140 Z",
    label: "Afghanistan",
  },
  MM: {
    d: "M 495,160 L 504,155 L 510,160 L 510,170 L 506,178 L 498,178 L 494,170 Z",
    label: "Myanmar",
  },
  BD: {
    d: "M 488,155 L 496,152 L 500,158 L 496,164 L 490,162 Z",
    label: "Bangladesh",
  },
  NP: {
    d: "M 468,148 L 478,144 L 484,148 L 482,154 L 476,156 L 468,154 Z",
    label: "Nepal",
  },
  LK: {
    d: "M 478,202 L 484,198 L 488,202 L 486,210 L 480,212 Z",
    label: "Sri Lanka",
  },
  GT: {
    d: "M 80,175 L 86,172 L 92,176 L 90,182 L 84,184 Z",
    label: "Guatemala",
  },
  HN: {
    d: "M 90,175 L 98,172 L 104,176 L 102,182 L 96,184 Z",
    label: "Honduras",
  },
  SV: {
    d: "M 85,182 L 92,180 L 96,184 L 92,188 L 86,186 Z",
    label: "El Salvador",
  },
  NI: {
    d: "M 96,180 L 104,178 L 108,184 L 104,190 L 98,188 Z",
    label: "Nicaragua",
  },
  CR: {
    d: "M 100,190 L 106,188 L 110,192 L 108,198 L 102,196 Z",
    label: "Costa Rica",
  },
  PA: {
    d: "M 108,195 L 116,192 L 122,196 L 120,202 L 114,200 Z",
    label: "Panama",
  },
  JM: {
    d: "M 108,172 L 114,170 L 118,174 L 114,178 Z",
    label: "Jamaica",
  },
  DO: {
    d: "M 126,170 L 134,168 L 138,172 L 134,176 Z",
    label: "Dominican Republic",
  },
  EC: {
    d: "M 105,200 L 112,196 L 118,200 L 116,208 L 110,210 Z",
    label: "Ecuador",
  },
  BO: {
    d: "M 120,235 L 130,230 L 138,234 L 138,244 L 132,250 L 122,248 Z",
    label: "Bolivia",
  },
  PY: {
    d: "M 140,248 L 148,244 L 155,248 L 154,256 L 148,260 L 140,258 Z",
    label: "Paraguay",
  },
  UY: {
    d: "M 155,270 L 162,266 L 168,270 L 166,278 L 160,280 L 155,276 Z",
    label: "Uruguay",
  },
  BY: {
    d: "M 330,98 L 340,95 L 348,98 L 350,104 L 345,108 L 336,108 L 330,104 Z",
    label: "Belarus",
  },
  MD: {
    d: "M 348,112 L 354,110 L 358,114 L 356,120 L 350,118 Z",
    label: "Moldova",
  },
  RS: {
    d: "M 325,128 L 332,126 L 338,130 L 336,136 L 330,138 L 324,134 Z",
    label: "Serbia",
  },
  HR: {
    d: "M 312,124 L 320,122 L 326,126 L 324,132 L 318,134 L 312,130 Z",
    label: "Croatia",
  },
  BA: {
    d: "M 316,130 L 324,128 L 328,132 L 326,138 L 320,136 Z",
    label: "Bosnia",
  },
  AL: {
    d: "M 328,138 L 334,136 L 338,140 L 336,146 L 330,144 Z",
    label: "Albania",
  },
  MK: {
    d: "M 334,136 L 340,134 L 344,138 L 342,144 L 336,142 Z",
    label: "North Macedonia",
  },
  SI: {
    d: "M 306,120 L 314,118 L 316,124 L 312,126 L 306,124 Z",
    label: "Slovenia",
  },
  LT: {
    d: "M 326,92 L 334,90 L 340,94 L 338,100 L 332,100 L 326,98 Z",
    label: "Lithuania",
  },
  LV: {
    d: "M 326,86 L 334,84 L 340,88 L 338,94 L 332,94 L 326,90 Z",
    label: "Latvia",
  },
  EE: {
    d: "M 326,80 L 334,78 L 340,82 L 338,88 L 332,88 L 326,84 Z",
    label: "Estonia",
  },
  GE: {
    d: "M 378,118 L 386,115 L 392,118 L 392,124 L 386,126 L 378,124 Z",
    label: "Georgia",
  },
  AM: {
    d: "M 388,124 L 394,122 L 398,126 L 396,132 L 390,130 Z",
    label: "Armenia",
  },
  AZ: {
    d: "M 396,120 L 404,118 L 408,124 L 406,130 L 400,128 L 396,126 Z",
    label: "Azerbaijan",
  },
  JO: {
    d: "M 362,150 L 370,148 L 374,152 L 372,160 L 366,158 Z",
    label: "Jordan",
  },
  LB: {
    d: "M 360,142 L 364,140 L 366,144 L 364,150 L 360,148 Z",
    label: "Lebanon",
  },
  QA: {
    d: "M 412,162 L 416,160 L 418,164 L 414,168 Z",
    label: "Qatar",
  },
  KW: {
    d: "M 398,152 L 404,150 L 406,155 L 402,158 Z",
    label: "Kuwait",
  },
  MN: {
    d: "M 478,95 L 500,90 L 520,92 L 535,98 L 536,106 L 528,112 L 510,114 L 492,112 L 480,108 Z",
    label: "Mongolia",
  },
  UZ: {
    d: "M 418,100 L 435,96 L 448,100 L 452,108 L 445,115 L 432,116 L 420,112 L 416,106 Z",
    label: "Uzbekistan",
  },
  IS: {
    d: "M 246,68 L 256,64 L 266,66 L 268,72 L 262,76 L 252,76 L 246,72 Z",
    label: "Iceland",
  },
  CY: {
    d: "M 352,142 L 358,140 L 362,144 L 358,148 L 352,146 Z",
    label: "Cyprus",
  },
  LU: {
    d: "M 288,112 L 292,110 L 294,114 L 290,116 Z",
    label: "Luxembourg",
  },
  TN: {
    d: "M 295,148 L 300,144 L 306,148 L 306,156 L 300,158 L 295,154 Z",
    label: "Tunisia",
  },
  NE: {
    d: "M 290,180 L 305,176 L 315,180 L 316,190 L 308,194 L 295,192 Z",
    label: "Niger",
  },
  ML: {
    d: "M 260,180 L 278,176 L 290,180 L 292,190 L 282,196 L 268,194 L 258,188 Z",
    label: "Mali",
  },
  BF: {
    d: "M 272,190 L 282,188 L 290,192 L 288,198 L 280,200 L 272,196 Z",
    label: "Burkina Faso",
  },
  TD: {
    d: "M 315,178 L 330,175 L 340,180 L 342,192 L 334,200 L 320,198 L 312,190 Z",
    label: "Chad",
  },
  UG: {
    d: "M 360,210 L 368,206 L 374,210 L 374,220 L 368,224 L 360,220 Z",
    label: "Uganda",
  },
};

function getHeatColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "rgba(255,255,255,0.03)";
  const ratio = Math.min(value / max, 1);
  if (ratio < 0.1) return "rgba(34, 197, 94, 0.3)";
  if (ratio < 0.2) return "rgba(34, 197, 94, 0.5)";
  if (ratio < 0.3) return "rgba(234, 179, 8, 0.4)";
  if (ratio < 0.4) return "rgba(234, 179, 8, 0.6)";
  if (ratio < 0.5) return "rgba(249, 115, 22, 0.5)";
  if (ratio < 0.65) return "rgba(249, 115, 22, 0.7)";
  if (ratio < 0.8) return "rgba(239, 68, 68, 0.6)";
  return "rgba(239, 68, 68, 0.85)";
}

function getHeatBorder(value: number, max: number): string {
  if (max === 0 || value === 0) return "rgba(255,255,255,0.05)";
  const ratio = Math.min(value / max, 1);
  if (ratio < 0.2) return "rgba(34, 197, 94, 0.4)";
  if (ratio < 0.4) return "rgba(234, 179, 8, 0.5)";
  if (ratio < 0.65) return "rgba(249, 115, 22, 0.6)";
  return "rgba(239, 68, 68, 0.7)";
}

export default function ThreatHeatmap({ topCountries, topGroups, onCountryClick }: ThreatHeatmapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const countryDataMap = useMemo(() => {
    const map: Record<string, { count: number; originalName: string }> = {};
    for (const c of topCountries) {
      for (const [code, names] of Object.entries(COUNTRY_NAME_MAP)) {
        if (names.some(n => n.toLowerCase() === c.name.toLowerCase())) {
          map[code] = { count: c.count, originalName: c.name };
          break;
        }
      }
    }
    return map;
  }, [topCountries]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...topCountries.map(c => c.count));
  }, [topCountries]);

  const topGroupForCountry = useCallback((countryName: string) => {
    if (!topGroups || topGroups.length === 0) return null;
    return topGroups[0]?.name || null;
  }, [topGroups]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleCountryClick = useCallback((code: string) => {
    const data = countryDataMap[code];
    if (data && onCountryClick) {
      onCountryClick(data.originalName);
    }
  }, [countryDataMap, onCountryClick]);

  const hoveredData = hoveredCountry ? countryDataMap[hoveredCountry] : null;
  const hoveredLabel = hoveredCountry ? COUNTRY_PATHS[hoveredCountry]?.label : null;

  return (
    <div className="space-y-4" data-testid="section-threat-heatmap">
      <Card className="border-white/5 bg-card/40 overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-400" aria-hidden="true" />
              Global Threat Activity Heatmap
            </h3>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: "rgba(34, 197, 94, 0.4)" }} />
                Low
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: "rgba(234, 179, 8, 0.5)" }} />
                Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: "rgba(249, 115, 22, 0.6)" }} />
                High
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: "rgba(239, 68, 68, 0.8)" }} />
                Critical
              </span>
            </div>
          </div>

          <div
            className="relative w-full"
            style={{ aspectRatio: "650/340" }}
            onMouseMove={handleMouseMove}
          >
            <svg
              viewBox="0 0 650 340"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="650" height="340" fill="rgba(0,0,0,0.3)" rx="4" />
              <rect width="650" height="340" fill="url(#grid)" rx="4" />

              {Object.entries(COUNTRY_PATHS).map(([code, { d, label }]) => {
                const data = countryDataMap[code];
                const count = data?.count || 0;
                const isHovered = hoveredCountry === code;
                return (
                  <path
                    key={code}
                    d={d}
                    fill={getHeatColor(count, maxCount)}
                    stroke={isHovered ? "rgba(249,115,22,0.9)" : getHeatBorder(count, maxCount)}
                    strokeWidth={isHovered ? 2 : 0.5}
                    className="cursor-pointer transition-all duration-150"
                    style={{
                      filter: isHovered ? "brightness(1.3)" : undefined,
                      transform: isHovered ? "scale(1.02)" : undefined,
                      transformOrigin: "center",
                    }}
                    onMouseEnter={() => setHoveredCountry(code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => handleCountryClick(code)}
                    data-testid={`country-${code.toLowerCase()}`}
                  >
                    <title>{`${label}: ${count} incidents`}</title>
                  </path>
                );
              })}
            </svg>

            {hoveredCountry && hoveredLabel && (
              <div
                className="absolute pointer-events-none z-50 bg-zinc-900/95 border border-white/10 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm"
                style={{
                  left: Math.min(tooltipPos.x + 12, (typeof window !== 'undefined' ? 400 : 400)),
                  top: tooltipPos.y - 60,
                  minWidth: 180,
                }}
                data-testid="tooltip-country"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3 w-3 text-orange-400" />
                  <span className="text-sm font-semibold text-white">{hoveredLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Target className="h-3 w-3 text-red-400" />
                  <span>{hoveredData?.count || 0} incident{(hoveredData?.count || 0) !== 1 ? 's' : ''}</span>
                </div>
                {topGroupForCountry(hoveredLabel) && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    <Users className="h-3 w-3 text-zinc-500" />
                    <span>Top group: {topGroupForCountry(hoveredLabel)}</span>
                  </div>
                )}
                {hoveredData && hoveredData.count > 0 && (
                  <div className="text-[10px] text-orange-400/70 mt-1 border-t border-white/5 pt-1">
                    Click to filter tracker
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {topCountries.slice(0, 12).map((country, i) => {
          const pct = maxCount > 0 ? (country.count / maxCount) * 100 : 0;
          return (
            <div
              key={country.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-orange-500/30 hover:bg-white/[0.04] transition-all cursor-pointer"
              onClick={() => onCountryClick?.(country.name)}
              data-testid={`card-country-${i}`}
            >
              <span className="text-xs text-zinc-500 w-5 text-right font-mono">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white truncate">{country.name}</span>
                  <Badge variant="outline" className="border-white/10 text-zinc-300 text-[10px] ml-2 shrink-0">
                    {country.count}
                  </Badge>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct > 70
                        ? "linear-gradient(90deg, #ef4444, #dc2626)"
                        : pct > 40
                          ? "linear-gradient(90deg, #f97316, #ea580c)"
                          : pct > 20
                            ? "linear-gradient(90deg, #eab308, #ca8a04)"
                            : "linear-gradient(90deg, #22c55e, #16a34a)",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {topCountries.length === 0 && (
        <Card className="border-white/5 bg-card/40">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No country-level data available yet.</p>
            <p className="text-zinc-600 text-xs mt-1">Data will appear as ransomware incidents are tracked.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}