export const useScannerStore = defineStore("scanner", {
  state: () => ({
    scannerWindow: null as Window | null,
  }),
  actions: {
    openScanner() {
      const w = window as any;
      console.log("openScanner", this.scannerWindow);
      if (w.openedScanner) {
        w.openedScanner.focus();
        return;
      }
      this.scannerWindow = w.openedScanner = window.open(
        "/driver/scanner",
        "Scanner",
        "popup"
      );
    },
    sendTripData(tripId: string, tripFare: number) {
      this.scannerWindow?.postMessage({
        type: "trip",
        trip: { id: tripId, fare: tripFare },
      });
    },
  },
});
