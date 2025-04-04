

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role" AS ENUM (
    'driver',
    'passenger',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_passenger_tokens"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    passenger_tokens float;
BEGIN
    -- Get the current token balance of the passenger
    SELECT balance INTO passenger_tokens FROM users WHERE id = NEW.user_id;

    -- Check if the passenger has enough tokens
    IF passenger_tokens < NEW.tokens THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- Proceed with the charge (you can add your charge logic here)
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_passenger_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."credit_driver"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_driver_id uuid;
BEGIN
    -- Get the driver ID from the vehicle associated with the trip
    SELECT v.driver_id INTO v_driver_id 
    FROM vehicles v 
    WHERE v.id = (SELECT t.vehicle_id FROM trips t WHERE t.id = NEW.id);
    
    -- Update the driver's balance with the collected fare
    UPDATE public.users u
    SET balance = balance + COALESCE(NEW.collected_fare, 0)
    WHERE u.id = v_driver_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."credit_driver"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_default_seat_capacity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    -- Set the seats_capacity to the capacity of the vehicle
    NEW.seats_capacity := (SELECT capacity FROM vehicles WHERE id = NEW.vehicle_id);
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."set_default_seat_capacity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_balance_and_collected_fare"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    -- Check transaction type and update user balance correctly
    IF NEW.transaction_type = 'debit' THEN
        UPDATE public.users
        SET balance = balance - COALESCE(NEW.tokens, 0) -- Deduct tokens for usage
        WHERE id = NEW.user_id;

        IF NEW.trip_id is not NULL THEN
            UPDATE public.trips
            SET collected_fare = collected_fare + COALESCE(NEW.tokens, 0), 
            seats_capacity = seats_capacity - 1
            WHERE id = NEW.trip_id;
        END IF;
    ELSIF NEW.transaction_type = 'credit' THEN
        UPDATE public.users
        SET balance = balance + COALESCE(NEW.tokens, 0) -- Add tokens for purchase
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."update_user_balance_and_collected_fare"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid",
    "route_id" "uuid",
    "booking_time" timestamp with time zone DEFAULT "now"(),
    "payment_status" "text" NOT NULL,
    "tokens_used" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "payment_time" timestamp with time zone DEFAULT "now"(),
    "payment_method" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "start_location" "text" NOT NULL,
    "end_location" "text" NOT NULL,
    "distance" integer NOT NULL,
    "average_time" integer,
    "fare" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."routes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tokens" real NOT NULL,
    "transaction_type" "text" NOT NULL,
    "transaction_time" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "trip_id" "uuid"
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid",
    "route_id" "uuid",
    "seats_capacity" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "actual_depart_time" timestamp without time zone,
    "actual_arrival_time" timestamp without time zone,
    "scheduled_arrival_time" timestamp without time zone NOT NULL,
    "scheduled_depart_time" timestamp without time zone NOT NULL,
    "collected_fare" real DEFAULT '0'::real
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "role" "public"."user_role" DEFAULT 'passenger'::"public"."user_role" NOT NULL,
    "balance" real DEFAULT '0'::real NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "license_plate" "text" NOT NULL,
    "model" "text" NOT NULL,
    "capacity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "driver_id" "uuid"
);


ALTER TABLE "public"."vehicles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "token_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "Update_user_balance" AFTER INSERT ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_balance_and_collected_fare"();



CREATE OR REPLACE TRIGGER "after_trip_completion" AFTER UPDATE OF "actual_arrival_time" ON "public"."trips" FOR EACH ROW WHEN (("new"."actual_arrival_time" IS NOT NULL)) EXECUTE FUNCTION "public"."credit_driver"();



CREATE OR REPLACE TRIGGER "before_insert_trips" BEFORE INSERT ON "public"."trips" FOR EACH ROW EXECUTE FUNCTION "public"."set_default_seat_capacity"();



CREATE OR REPLACE TRIGGER "check_balance" BEFORE INSERT ON "public"."transactions" FOR EACH STATEMENT EXECUTE FUNCTION "public"."check_passenger_tokens"();



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."trips";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."users";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."check_passenger_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_passenger_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_passenger_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."credit_driver"() TO "anon";
GRANT ALL ON FUNCTION "public"."credit_driver"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."credit_driver"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_default_seat_capacity"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_default_seat_capacity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_default_seat_capacity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_balance_and_collected_fare"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_balance_and_collected_fare"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_balance_and_collected_fare"() TO "service_role";


















GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."routes" TO "anon";
GRANT ALL ON TABLE "public"."routes" TO "authenticated";
GRANT ALL ON TABLE "public"."routes" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."vehicles" TO "anon";
GRANT ALL ON TABLE "public"."vehicles" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
