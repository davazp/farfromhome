const sources = [
  "public/audio/01. blip pad.mp3",
  "public/audio/02. sub.mp3",
  "public/audio/03. atm.mp3",
  "public/audio/04. vc loss.mp3",
  "public/audio/05. blip else.mp3",
  "public/audio/06. vc gain.mp3",
  "public/audio/07. bass.mp3",
  "public/audio/08. drs.mp3"
];

export class Music {
  constructor() {
    this.tracks = sources.map(src => new Audio(src));
    let loading = this.tracks.length;

    this.tracks.forEach(a => {
      a.addEventListener("loadeddata", () => {
        loading--;
      });
      a.load();
      a.volume = 0;
      a.loop = true;
    });

    const startPlayback = () => {
      if (loading > 0) {
        return;
      }
      window.removeEventListener("mousedown", startPlayback);
      this.tracks.forEach(a => a.play());
    };

    this.setMood(0.5);
    window.addEventListener("mousedown", startPlayback);
  }

  getMood() {
    return this.mood;
  }

  setMood(x) {
    if (x === this.mood) {
      return;
    }
    this.mood = Math.min(Math.max(x, 0), 1);

    const stage = this.mood * 5 + 1;
    this.tracks[0].volume = 0.1 + 0.4 * this.mood; // blip pad
    this.tracks[1].volume = 1 - this.mood * 0.6; // sub
    this.tracks[2].volume = 1 - this.mood * 0.6; // atm
    this.tracks[3].volume = this.mood <= 0.2 ? 1 : 0; // vc loss
    this.tracks[4].volume = this.mood >= 0.2 ? 0.7 * x : 0; // blip else
    this.tracks[5].volume = this.mood >= 0.6 ? 1 : 0; // vc gain
    this.tracks[6].volume = this.mood >= 0.8 ? 1 : 0; // bass
    this.tracks[7].volume = this.mood >= 0.9 ? 0.7 * x : 0; // drs
  }
}
