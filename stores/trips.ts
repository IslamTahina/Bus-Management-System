export const useTripsStore = defineStore("trips", {
  state: () => ({
    trips: [] as any,
    currentActiveTrip: null as any,
  }),
  actions: {
    async getTrips() {
      const user = useSupabaseUser();
      const supabase = useSupabaseClient();
      if (!user.value) {
        throw new Error("No user found");
      }

      const { data: trips, error: tripsErr } = await supabase
        .from("trips")
        .select("*, vehicles(*), routes(*)")
        .eq("vehicles.driver_id", user.value.id)
        .is("actual_depart_time", null)
        .order("scheduled_depart_time", { ascending: true });

      if (tripsErr) throw tripsErr;

      this.trips = trips;
      const vehicleId = trips[0]?.vehicles?.id;
      if (vehicleId) {
        supabase
          .channel("trips")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "trips",
              filter: "vehicle_id=eq." + vehicleId,
            },
            (payload) => {
              this.trips = this.trips.map((trip: any) => {
                if (trip.id == payload.new.id) {
                  return payload.new;
                }
                return trip;
              });
              if (payload.new.id == this.currentActiveTrip?.id) {
                this.currentActiveTrip = payload.new;
              }
            }
          )
          .subscribe();
      }
    },
    activateTrip(tripId: string) {
      console.log("activateTrip", tripId);
      this.currentActiveTrip = this.trips.find(
        (trip: any) => trip.id == tripId
      );
      console.log("currentActiveTrip", this.currentActiveTrip);
      useScannerStore().sendTripData(
        tripId,
        this.currentActiveTrip?.routes.fare
      );
    },
    async updatePassengerCount(value: number) {
      const count = this.currentActiveTrip.vehicles.capacity - value;
      const supabase = useSupabaseClient();
      const { data: trip, error: tripErr } = await supabase
        .from("trips")
        .update({ seats_capacity: count })
        .eq("id", this.currentActiveTrip.id);

      if (tripErr) throw tripErr;
      this.currentActiveTrip.seats_capacity = count;
    },
    async setAvailableSeats(count: number) {
      const supabase = useSupabaseClient();
      const { data: trip, error: tripErr } = await supabase
        .from("trips")
        .update({ seats_capacity: count })
        .eq("id", this.currentActiveTrip.id);

      if (tripErr) throw tripErr;
      this.currentActiveTrip.seats_capacity = count;
    },

    async passangerLeft() {
      const supabase = useSupabaseClient();
      const { data: trip, error: tripErr } = await supabase
        .from("trips")
        .update({ seats_capacity: this.currentActiveTrip.seats_capacity + 1 })
        .eq("id", this.currentActiveTrip.id);

      if (tripErr) throw tripErr;
      this.currentActiveTrip.seats_capacity += 1;
    },

    async setDepartureTime() {
      if (this.currentActiveTrip) {
        const supabase = useSupabaseClient();
        const { data: trip, error: tripErr } = await supabase
          .from("trips")
          .update({ actual_depart_time: new Date().toISOString() })
          .eq("id", this.currentActiveTrip.id);

        if (tripErr) throw tripErr;
        this.currentActiveTrip.actual_depart_time = new Date().toISOString();
      }
    },
    endTrip() {
      this.SetArrivalTime(this.currentActiveTrip.id);
      this.currentActiveTrip = null;
    },
    async SetArrivalTime(tripId: string) {
      const supabase = useSupabaseClient();
      const { data: trip, error: tripErr } = await supabase
        .from("trips")
        .update({ actual_arrival_time: new Date().toISOString() })
        .eq("id", tripId);

      if (tripErr) throw tripErr;

      this.currentActiveTrip.actual_arrival_time = new Date().toISOString();
    },
  },
});

/*
 if (trips && trips.length > 0) {
            const currentTime = new Date()
            
            
            // Find the current trip based on time window
            const currentTripData = trips.find(trip => {
              console.log('Processing trip:', trip)
              console.log('Start time string:', trip.scheduled_depart_time)
              
              const startTime = new Date(trip.scheduled_depart_time)
              const endTime = new Date(trip.scheduled_arrival_time)
              
              // If the trip hasn't ended yet and either:
              // 1. It's currently within the time window, or
              // 2. It's starting now (within 5 minutes of current time)
              const isWithinTimeWindow = currentTime >= startTime && currentTime <= endTime
              const isStartingNow = Math.abs(startTime.getTime() - currentTime.getTime()) <= 5 * 60 * 1000 // 5 minutes
              
              console.log('Time comparison:', {
                currentTime: currentTime.toLocaleString(),
                startTime: startTime.toLocaleString(),
                endTime: endTime.toLocaleString(),
                isWithinTimeWindow,
                isStartingNow,
                notEnded: !trip.actual_arrival_time
              })
              
              return (isWithinTimeWindow || isStartingNow) && !trip.actual_arrival_time
            })
            
            if (currentTripData) {
              console.log('Found active trip:', currentTripData)
              
              // If this trip wasn't previously active, set it as active
              if (!currentTripData.actual_depart_time) {
                const { error: updateError } = await supabase
                  .from('trips')
                  .update({ actual_depart_time: new Date().toISOString() })
                  .eq('id', currentTripData.id)
                
                if (updateError) {
                  console.error('Error setting trip as active:', updateError)
                } else {
                  // Update the local trip data with the new actual_depart_time
                  currentTripData.actual_depart_time = new Date().toISOString()
                }
              }
              
              currentTrip.value = currentTripData
              // Initialize passenger count and collected fare from the trip data
              passengerCount.value = 0 // We'll update this when we implement passenger tracking
              collectedFare.value = currentTripData.collected_fare || 0
            } else {
              console.log('No active trip found')
              currentTrip.value = null
            }
      
            // Filter upcoming trips to only show future trips
            const currentTripIndex = typedTrips.findIndex(trip => trip.id === currentTrip.value?.id)
            upcomingTrips.value = typedTrips
              .slice(currentTripIndex + 1)
              .filter(trip => {
                const tripStartTime = new Date(trip.scheduled_depart_time)
                return tripStartTime > currentTime && !trip.actual_arrival_time
              })
              .map(trip => ({
                ...trip,
                actual_arrival_time: null
              }))
          }
        } catch (err: any) {
          console.error('Error fetching trips:', err)
          error.value = 'Failed to load trips'
        } finally {
          isLoading.value = false
        }
          */
