export const TEAM_FLAGS = {
  "USA":"🇺🇸","Mexico":"🇲🇽","Canada":"🇨🇦","Panama":"🇵🇦","Honduras":"🇭🇳",
  "Jamaica":"🇯🇲","Costa Rica":"🇨🇷","Brazil":"🇧🇷","Argentina":"🇦🇷",
  "Colombia":"🇨🇴","Uruguay":"🇺🇾","Ecuador":"🇪🇨","Chile":"🇨🇱",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","France":"🇫🇷","Germany":"🇩🇪","Spain":"🇪🇸",
  "Portugal":"🇵🇹","Netherlands":"🇳🇱","Belgium":"🇧🇪","Italy":"🇮🇹",
  "Croatia":"🇭🇷","Poland":"🇵🇱","Austria":"🇦🇹","Denmark":"🇩🇰",
  "Serbia":"🇷🇸","Ukraine":"🇺🇦","Switzerland":"🇨🇭","Albania":"🇦🇱",
  "Hungary":"🇭🇺","Romania":"🇷🇴","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Turkey":"🇹🇷",
  "Morocco":"🇲🇦","Senegal":"🇸🇳","Cameroon":"🇨🇲","Egypt":"🇪🇬",
  "Nigeria":"🇳🇬","Ghana":"🇬🇭","Ivory Coast":"🇨🇮","Tunisia":"🇹🇳",
  "Algeria":"🇩🇿","Japan":"🇯🇵","South Korea":"🇰🇷","Australia":"🇦🇺",
  "Iran":"🇮🇷","Saudi Arabia":"🇸🇦","Indonesia":"🇮🇩","New Zealand":"🇳🇿",
  "TBD":"🏳️",
};

export const getFlag = (team) => TEAM_FLAGS[team] || "🏳️";

export const ALL_TEAMS = Object.keys(TEAM_FLAGS).filter(t => t !== "TBD").sort();

export const INITIAL_GROUPS = {
  A: ["USA","Panama","Albania","Ukraine"],
  B: ["Mexico","Indonesia","Senegal","Serbia"],
  C: ["Canada","TBD","TBD","TBD"],
  D: ["Brazil","TBD","TBD","TBD"],
  E: ["England","TBD","TBD","TBD"],
  F: ["Germany","TBD","TBD","TBD"],
  G: ["France","TBD","TBD","TBD"],
  H: ["Spain","TBD","TBD","TBD"],
  I: ["Portugal","TBD","TBD","TBD"],
  J: ["Netherlands","TBD","TBD","TBD"],
  K: ["Japan","TBD","TBD","TBD"],
  L: ["Morocco","TBD","TBD","TBD"],
};
