import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'

type Trip = Database['public']['Tables']['trips']['Row'] & {
  vehicles?: Database['public']['Tables']['vehicles']['Row'] | null
  routes?: Database['public']['Tables']['routes']['Row'] | null
}

export const useTripsStore = defineStore("trips", {
  state: () => ({
    trips: [] as Trip[],
    currentActiveTrip: null as Trip | null,
    subscriptions: [] as any[],
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

      this.trips = trips as Trip[];
      
      // Restore active trip from localStorage if it exists
      const savedActiveTripId = localStorage.getItem('activeTripId');
      if (savedActiveTripId) {
        const savedTrip = this.trips.find(trip => trip.id === savedActiveTripId);
        if (savedTrip) {
          this.currentActiveTrip = savedTrip;
          // Send trip data to scanner
          useScannerStore().sendTripData(
            savedTrip.id,
            savedTrip.routes?.fare || 0
          );
        }
      }
    },

    activateTrip(tripId: string) {
      console.log("activateTrip", tripId);
      const trip = this.trips.find(
        (trip) => trip.id == tripId
      );
      if (trip) {
        this.currentActiveTrip = trip;
        // Save active trip to localStorage
        localStorage.setItem('activeTripId', trip.id);
        console.log("currentActiveTrip", this.currentActiveTrip);
        
        useScannerStore().sendTripData(
          tripId,
          trip.routes?.fare || 0
        );
      }
    },

    async endTrip() {
      if (!this.currentActiveTrip) return;
      
      // First set the arrival time
      await this.SetArrivalTime(this.currentActiveTrip.id);
      
      // Then clear the current trip and localStorage
      this.currentActiveTrip = null;
      localStorage.removeItem('activeTripId');

      // Fetch trips again to get the next available trip
      await this.getTrips();
    },

    async updatePassengerCount(value: number) {
      if (!this.currentActiveTrip?.vehicles) return;
      const count = this.currentActiveTrip.vehicles.capacity - value;
      this.currentActiveTrip.seats_capacity = count;
    },

    async setAvailableSeats(count: number) {
      if (!this.currentActiveTrip) return;
      const supabase = useSupabaseClient();
      const { error } = await supabase
        .from("trips")
        .update({ seats_capacity: count })
        .eq("id", this.currentActiveTrip.id);

      if (error) throw error;
      this.currentActiveTrip.seats_capacity = count;
    },

    async passangerLeft(value: number) {
      if (!this.currentActiveTrip) return;
      const count = this.currentActiveTrip.seats_capacity + 1;
      this.currentActiveTrip.seats_capacity = count;
    },

    async setDepartureTime(tripId: string) {
      if (!this.currentActiveTrip) return;
      const supabase = useSupabaseClient();
      const { error } = await supabase
        .from("trips")
        .update({ actual_depart_time: new Date().toISOString() })
        .eq("id", this.currentActiveTrip.id);

      if (error) throw error;
      this.currentActiveTrip.actual_depart_time = new Date().toISOString();
    },

    async SetArrivalTime(tripId: string) {
      if (!this.currentActiveTrip) return;
      const supabase = useSupabaseClient();
      const { error } = await supabase
        .from("trips")
        .update({ actual_arrival_time: new Date().toISOString() })
        .eq("id", this.currentActiveTrip.id);

      if (error) throw error;
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
