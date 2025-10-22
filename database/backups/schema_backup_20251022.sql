NOTICE:  Welcome to Neon!, session_id: 75c18a7c-33d4-434e-babe-fb70ebd92561
--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addon_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addon_products (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    price numeric(10,2) NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_by_admin_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: agreement_acceptances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agreement_acceptances (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    agreement_type text NOT NULL,
    booking_id character varying,
    ip_address text,
    user_agent text,
    digital_signature text,
    agreed_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    vehicle_id character varying NOT NULL,
    is_guest_booking boolean DEFAULT false NOT NULL,
    guest_email character varying,
    guest_phone character varying,
    guest_name character varying,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    pickup_option text NOT NULL,
    delivery_address text,
    total_amount numeric(10,2) NOT NULL,
    delivery_charge numeric(10,2) DEFAULT '0'::numeric,
    has_extra_insurance boolean DEFAULT false NOT NULL,
    insurance_amount numeric(10,2) DEFAULT '0'::numeric,
    platform_commission numeric(10,2) DEFAULT '0'::numeric,
    owner_earnings numeric(10,2) DEFAULT '0'::numeric,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    payment_intent_id text,
    refund_amount numeric(10,2),
    cancelled_at timestamp without time zone,
    pickup_completed_at timestamp without time zone,
    return_completed_at timestamp without time zone,
    pickup_odometer_reading integer,
    return_odometer_reading integer,
    fuel_level_at_pickup text,
    fuel_level_at_return text,
    pickup_video_url text,
    pickup_video_approved_by_customer boolean DEFAULT false,
    pickup_video_approved_by_owner boolean DEFAULT false,
    pickup_video_approved_at timestamp without time zone,
    return_video_url text,
    return_video_approved_by_customer boolean DEFAULT false,
    return_video_approved_by_owner boolean DEFAULT false,
    return_video_approved_at timestamp without time zone,
    actual_return_time timestamp without time zone,
    is_late_return boolean DEFAULT false,
    late_return_minutes integer DEFAULT 0,
    late_return_charge numeric(10,2) DEFAULT '0'::numeric,
    late_fee_waived boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: challans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    vehicle_id character varying NOT NULL,
    booking_id character varying,
    challan_number text NOT NULL,
    challan_date timestamp without time zone NOT NULL,
    challan_time text NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text NOT NULL,
    proof_url text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    paid_by_customer boolean DEFAULT false,
    uploaded_by_owner_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: insurance_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insurance_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    owner_id character varying NOT NULL,
    vehicle_id character varying,
    insurance_type text NOT NULL,
    coverage_amount numeric(10,2),
    request_reason text,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    contacted_at timestamp without time zone,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: owner_addon_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owner_addon_purchases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    owner_id character varying NOT NULL,
    vehicle_id character varying,
    addon_product_id character varying NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    payment_intent_id text,
    purchased_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: owner_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owner_addresses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    owner_id character varying NOT NULL,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text DEFAULT 'Bhubaneswar'::text NOT NULL,
    state text DEFAULT 'Odisha'::text NOT NULL,
    pincode text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ratings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    booking_id character varying NOT NULL,
    vehicle_id character varying,
    rater_id character varying NOT NULL,
    ratee_id character varying NOT NULL,
    rating_type text NOT NULL,
    rating integer NOT NULL,
    review text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    referrer_id character varying NOT NULL,
    referee_id character varying NOT NULL,
    amount numeric(10,2) DEFAULT '50'::numeric NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    credited_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: toll_fees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.toll_fees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    booking_id character varying NOT NULL,
    vehicle_id character varying NOT NULL,
    customer_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    proof_url text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    paid_at timestamp without time zone,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    phone text,
    role text DEFAULT 'customer'::text NOT NULL,
    aadhar_number text,
    aadhar_photo_url text,
    pan_number text,
    pan_photo_url text,
    dl_number text,
    dl_photo_url text,
    is_kyc_verified boolean DEFAULT false NOT NULL,
    kyc_verified_at timestamp without time zone,
    digilocker_linked boolean DEFAULT false NOT NULL,
    wallet_balance numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    security_deposit_paid boolean DEFAULT false NOT NULL,
    security_deposit_amount numeric(10,2),
    has_membership boolean DEFAULT false NOT NULL,
    membership_purchased_at timestamp without time zone,
    membership_expires_at timestamp without time zone,
    referral_code character varying,
    referred_by character varying,
    average_rating_as_customer numeric(3,2) DEFAULT '0'::numeric,
    total_ratings_as_customer integer DEFAULT 0,
    average_rating_as_owner numeric(3,2) DEFAULT '0'::numeric,
    total_ratings_as_owner integer DEFAULT 0,
    payu_vendor_id text,
    upi_id text,
    bank_account_number text,
    bank_ifsc_code text,
    bank_account_holder_name text,
    gst_number text,
    is_payu_vendor_verified boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: vehicle_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_documents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    vehicle_id character varying NOT NULL,
    document_type text NOT NULL,
    document_url text NOT NULL,
    document_number text,
    expiry_date timestamp without time zone,
    is_verified boolean DEFAULT false NOT NULL,
    verified_at timestamp without time zone,
    uploaded_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    owner_id character varying NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    category text DEFAULT 'economy'::text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    year integer NOT NULL,
    seats integer,
    fuel_type text NOT NULL,
    transmission text NOT NULL,
    registration_number text NOT NULL,
    price_per_hour numeric(10,2) NOT NULL,
    price_per_day numeric(10,2) NOT NULL,
    location text NOT NULL,
    location_place_id text,
    location_lat numeric(10,7),
    location_lng numeric(10,7),
    manual_address_line_1 text,
    manual_address_line_2 text,
    manual_city text,
    manual_state text,
    manual_pincode text,
    owner_location text DEFAULT 'Bhubaneswar'::text NOT NULL,
    image_url text NOT NULL,
    features text[],
    rc_document_url text,
    insurance_document_url text,
    puc_document_url text,
    has_extra_insurance boolean DEFAULT false NOT NULL,
    extra_insurance_cost numeric(10,2) DEFAULT '0'::numeric,
    has_gps_tracking boolean DEFAULT false NOT NULL,
    gps_device_id text,
    average_rating numeric(3,2) DEFAULT '0'::numeric,
    total_ratings integer DEFAULT 0,
    verification_status text DEFAULT 'pending'::text NOT NULL,
    verified_at timestamp without time zone,
    verified_by_admin_id character varying,
    rejection_reason text,
    available boolean DEFAULT true NOT NULL,
    is_paused boolean DEFAULT false NOT NULL,
    current_status text DEFAULT 'idle'::text NOT NULL,
    availability_type text DEFAULT 'always'::text NOT NULL,
    available_from_time text,
    available_to_time text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: video_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_verifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    booking_id character varying NOT NULL,
    video_url text NOT NULL,
    uploaded_by character varying NOT NULL,
    approved_by_customer boolean DEFAULT false NOT NULL,
    approved_by_owner boolean DEFAULT false NOT NULL,
    customer_approved_at timestamp without time zone,
    owner_approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    amount numeric(10,2) NOT NULL,
    balance_after numeric(10,2) NOT NULL,
    source text NOT NULL,
    description text NOT NULL,
    referral_id character varying,
    booking_id character varying,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: addon_products addon_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addon_products
    ADD CONSTRAINT addon_products_pkey PRIMARY KEY (id);


--
-- Name: agreement_acceptances agreement_acceptances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_acceptances
    ADD CONSTRAINT agreement_acceptances_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: challans challans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challans
    ADD CONSTRAINT challans_pkey PRIMARY KEY (id);


--
-- Name: insurance_requests insurance_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance_requests
    ADD CONSTRAINT insurance_requests_pkey PRIMARY KEY (id);


--
-- Name: owner_addon_purchases owner_addon_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_addon_purchases
    ADD CONSTRAINT owner_addon_purchases_pkey PRIMARY KEY (id);


--
-- Name: owner_addresses owner_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_addresses
    ADD CONSTRAINT owner_addresses_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: toll_fees toll_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.toll_fees
    ADD CONSTRAINT toll_fees_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicle_documents vehicle_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_documents
    ADD CONSTRAINT vehicle_documents_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_registration_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_registration_number_unique UNIQUE (registration_number);


--
-- Name: video_verifications video_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_verifications
    ADD CONSTRAINT video_verifications_pkey PRIMARY KEY (id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: agreement_acceptances_booking_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX agreement_acceptances_booking_idx ON public.agreement_acceptances USING btree (booking_id);


--
-- Name: agreement_acceptances_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX agreement_acceptances_user_idx ON public.agreement_acceptances USING btree (user_id);


--
-- Name: bookings_dates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_dates_idx ON public.bookings USING btree (start_date, end_date);


--
-- Name: bookings_guest_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_guest_email_idx ON public.bookings USING btree (guest_email);


--
-- Name: bookings_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_status_idx ON public.bookings USING btree (status);


--
-- Name: bookings_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_user_idx ON public.bookings USING btree (user_id);


--
-- Name: bookings_vehicle_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_vehicle_idx ON public.bookings USING btree (vehicle_id);


--
-- Name: insurance_requests_owner_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX insurance_requests_owner_idx ON public.insurance_requests USING btree (owner_id);


--
-- Name: insurance_requests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX insurance_requests_status_idx ON public.insurance_requests USING btree (status);


--
-- Name: referrals_referee_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX referrals_referee_idx ON public.referrals USING btree (referee_id);


--
-- Name: referrals_referrer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX referrals_referrer_idx ON public.referrals USING btree (referrer_id);


--
-- Name: vehicles_available_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vehicles_available_idx ON public.vehicles USING btree (available);


--
-- Name: vehicles_owner_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vehicles_owner_idx ON public.vehicles USING btree (owner_id);


--
-- Name: vehicles_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vehicles_type_idx ON public.vehicles USING btree (type);


--
-- Name: vehicles_verification_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vehicles_verification_idx ON public.vehicles USING btree (verification_status);


--
-- Name: wallet_transactions_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallet_transactions_type_idx ON public.wallet_transactions USING btree (type);


--
-- Name: wallet_transactions_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallet_transactions_user_idx ON public.wallet_transactions USING btree (user_id);


--
-- Name: addon_products addon_products_created_by_admin_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addon_products
    ADD CONSTRAINT addon_products_created_by_admin_id_users_id_fk FOREIGN KEY (created_by_admin_id) REFERENCES public.users(id);


--
-- Name: agreement_acceptances agreement_acceptances_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_acceptances
    ADD CONSTRAINT agreement_acceptances_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: agreement_acceptances agreement_acceptances_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_acceptances
    ADD CONSTRAINT agreement_acceptances_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: challans challans_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challans
    ADD CONSTRAINT challans_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: challans challans_uploaded_by_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challans
    ADD CONSTRAINT challans_uploaded_by_owner_id_users_id_fk FOREIGN KEY (uploaded_by_owner_id) REFERENCES public.users(id);


--
-- Name: challans challans_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challans
    ADD CONSTRAINT challans_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: insurance_requests insurance_requests_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance_requests
    ADD CONSTRAINT insurance_requests_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: insurance_requests insurance_requests_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance_requests
    ADD CONSTRAINT insurance_requests_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: owner_addon_purchases owner_addon_purchases_addon_product_id_addon_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_addon_purchases
    ADD CONSTRAINT owner_addon_purchases_addon_product_id_addon_products_id_fk FOREIGN KEY (addon_product_id) REFERENCES public.addon_products(id);


--
-- Name: owner_addon_purchases owner_addon_purchases_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_addon_purchases
    ADD CONSTRAINT owner_addon_purchases_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: owner_addon_purchases owner_addon_purchases_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_addon_purchases
    ADD CONSTRAINT owner_addon_purchases_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: owner_addresses owner_addresses_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owner_addresses
    ADD CONSTRAINT owner_addresses_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: ratings ratings_ratee_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_ratee_id_users_id_fk FOREIGN KEY (ratee_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_rater_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_rater_id_users_id_fk FOREIGN KEY (rater_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: referrals referrals_referee_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referee_id_users_id_fk FOREIGN KEY (referee_id) REFERENCES public.users(id);


--
-- Name: referrals referrals_referrer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_users_id_fk FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: toll_fees toll_fees_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.toll_fees
    ADD CONSTRAINT toll_fees_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: toll_fees toll_fees_customer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.toll_fees
    ADD CONSTRAINT toll_fees_customer_id_users_id_fk FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: toll_fees toll_fees_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.toll_fees
    ADD CONSTRAINT toll_fees_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: toll_fees toll_fees_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.toll_fees
    ADD CONSTRAINT toll_fees_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: users users_referred_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referred_by_users_id_fk FOREIGN KEY (referred_by) REFERENCES public.users(id);


--
-- Name: vehicle_documents vehicle_documents_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_documents
    ADD CONSTRAINT vehicle_documents_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicles vehicles_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: vehicles vehicles_verified_by_admin_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_verified_by_admin_id_users_id_fk FOREIGN KEY (verified_by_admin_id) REFERENCES public.users(id);


--
-- Name: video_verifications video_verifications_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_verifications
    ADD CONSTRAINT video_verifications_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: wallet_transactions wallet_transactions_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: wallet_transactions wallet_transactions_referral_id_referrals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_referral_id_referrals_id_fk FOREIGN KEY (referral_id) REFERENCES public.referrals(id);


--
-- Name: wallet_transactions wallet_transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

