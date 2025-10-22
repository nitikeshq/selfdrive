NOTICE:  Welcome to Neon!, session_id: 2e68dc69-277d-4b64-9af2-b4afdc998d34
pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: users
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
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

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, first_name, last_name, profile_image_url, phone, role, aadhar_number, aadhar_photo_url, pan_number, pan_photo_url, dl_number, dl_photo_url, is_kyc_verified, kyc_verified_at, digilocker_linked, wallet_balance, security_deposit_paid, security_deposit_amount, has_membership, membership_purchased_at, membership_expires_at, referral_code, referred_by, average_rating_as_customer, total_ratings_as_customer, average_rating_as_owner, total_ratings_as_owner, payu_vendor_id, upi_id, bank_account_number, bank_ifsc_code, bank_account_holder_name, gst_number, is_payu_vendor_verified, created_at, updated_at) FROM stdin;
c1746e46-b159-4f8f-8881-a3ca0511130c	siddharth.hati@qwegle.com	$2b$10$miRxgQ/AuImdormExCAZIezElW8w87uopmN5GDfWx.ctbxPzxlG/y	Siddhartha	Hati	\N	\N	owner	\N	\N	\N	\N	\N	\N	f	\N	f	0.00	f	\N	f	\N	\N	\N	\N	0.00	0	0.00	0	\N	\N	\N	\N	\N	\N	f	2025-10-22 10:30:10.819025	2025-10-22 10:30:10.819025
66333776-0f2a-4320-b7f4-029322fbcced	chinmay.gayan@driveease.in	$2b$10$qvHrtE18Y/7PMmvOlJZBUusRsVzpZW2hK.NSvk.yE8PTtFgcDGj16	Chinmay Sourav	Gayan	\N	\N	owner	\N	\N	\N	\N	\N	\N	f	\N	f	0.00	f	\N	f	\N	\N	CHINMAY2024	\N	0.00	0	0.00	0	\N	\N	\N	\N	\N	\N	f	2025-10-22 10:58:20.576901	2025-10-22 10:58:20.576901
\.


--
-- Data for Name: addon_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.addon_products (id, name, description, category, price, image_url, is_active, created_by_admin_id, created_at) FROM stdin;
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicles (id, owner_id, name, type, category, brand, model, year, seats, fuel_type, transmission, registration_number, price_per_hour, price_per_day, location, location_place_id, location_lat, location_lng, manual_address_line_1, manual_address_line_2, manual_city, manual_state, manual_pincode, owner_location, image_url, features, rc_document_url, insurance_document_url, puc_document_url, has_extra_insurance, extra_insurance_cost, has_gps_tracking, gps_device_id, average_rating, total_ratings, verification_status, verified_at, verified_by_admin_id, rejection_reason, available, is_paused, current_status, availability_type, available_from_time, available_to_time, created_at) FROM stdin;
21b76e3c-088b-47c5-8cc4-cc8c71c7c0d9	66333776-0f2a-4320-b7f4-029322fbcced	Tata Altroz CNG	car	hatchback	Tata	Altroz CNG	2023	5	petrol	manual	OD-XX-XXXX	90.00	1200.00	Bhubaneswar, Odisha	\N	\N	\N	\N	\N	\N	\N	\N	Bhubaneswar	https://selfdrive-easy.s3.us-east-1.amazonaws.com/vehicles/21b76e3c-088b-47c5-8cc4-cc8c71c7c0d9/tata_altroz_cng_hatc_6c1b38ab.jpg	{"CNG Kit",Bluetooth,"Touchscreen Infotainment","Rear Parking Sensors"}	\N	insurance_valid	\N	f	0.00	f	\N	0.00	0	pending	\N	\N	\N	t	f	idle	always	\N	\N	2025-10-22 10:59:19.8537
b7393856-6111-4760-9fdf-d11c2168a905	66333776-0f2a-4320-b7f4-029322fbcced	Maruti Suzuki Baleno Hybrid	car	hatchback	Maruti Suzuki	Baleno CNG	2023	5	petrol	manual	OD-XX-XXXY	95.00	1300.00	Bhubaneswar, Odisha	\N	\N	\N	\N	\N	\N	\N	\N	Bhubaneswar	https://selfdrive-easy.s3.us-east-1.amazonaws.com/vehicles/b7393856-6111-4760-9fdf-d11c2168a905/maruti_suzuki_baleno_98313b86.jpg	{"CNG/Petrol Dual Fuel","Automatic Climate Control",Touchscreen,Airbags}	\N	insurance_valid	\N	f	0.00	f	\N	0.00	0	pending	\N	\N	\N	t	f	idle	always	\N	\N	2025-10-22 10:59:19.8537
154f8db7-04ee-47bb-83db-815208fe3540	66333776-0f2a-4320-b7f4-029322fbcced	Ford EcoSport Diesel	car	compact_suv	Ford	EcoSport	2021	5	diesel	manual	OD-XX-XXXZ	110.00	1600.00	Bhubaneswar, Odisha	\N	\N	\N	\N	\N	\N	\N	\N	Bhubaneswar	https://selfdrive-easy.s3.us-east-1.amazonaws.com/vehicles/154f8db7-04ee-47bb-83db-815208fe3540/ford_ecosport_white__5fd7a040.jpg	{"Diesel Engine","High Ground Clearance",Touchscreen,"Cruise Control",Airbags}	\N	insurance_valid	\N	f	0.00	f	\N	0.00	0	pending	\N	\N	\N	t	f	idle	always	\N	\N	2025-10-22 10:59:19.8537
9f489d13-fbed-4708-b2d1-fd9bd7c77c30	66333776-0f2a-4320-b7f4-029322fbcced	Ford Aspire Diesel	car	sedan	Ford	Aspire	2022	5	diesel	manual	OD-XX-XXXA	100.00	1400.00	Bhubaneswar, Odisha	\N	\N	\N	\N	\N	\N	\N	\N	Bhubaneswar	https://selfdrive-easy.s3.us-east-1.amazonaws.com/vehicles/9f489d13-fbed-4708-b2d1-fd9bd7c77c30/ford_aspire_sedan_bl_5114e8cd.jpg	{"Diesel Engine","Spacious Boot",Touchscreen,"Rear AC Vents",Airbags}	\N	insurance_valid	\N	f	0.00	f	\N	0.00	0	pending	\N	\N	\N	t	f	idle	always	\N	\N	2025-10-22 10:59:19.8537
80958879-236c-46b1-8cce-34f3f60f498b	66333776-0f2a-4320-b7f4-029322fbcced	Hyundai Creta 2022 Sunroof	car	suv	Hyundai	Creta	2022	5	petrol	manual	OD-XX-XXXB	150.00	2200.00	Bhubaneswar, Odisha	\N	\N	\N	\N	\N	\N	\N	\N	Bhubaneswar	https://selfdrive-easy.s3.us-east-1.amazonaws.com/vehicles/80958879-236c-46b1-8cce-34f3f60f498b/hyundai_creta_2022_s_60bb4b7e.jpg	{Sunroof,"Touchscreen with Android Auto","Cruise Control","Automatic Climate Control","Leather Seats","6 Airbags"}	\N	insurance_valid	\N	f	0.00	f	\N	0.00	0	pending	\N	\N	\N	t	f	idle	always	\N	\N	2025-10-22 10:59:19.8537
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, user_id, vehicle_id, is_guest_booking, guest_email, guest_phone, guest_name, start_date, end_date, pickup_option, delivery_address, total_amount, delivery_charge, has_extra_insurance, insurance_amount, platform_commission, owner_earnings, status, payment_status, payment_intent_id, refund_amount, cancelled_at, pickup_completed_at, return_completed_at, pickup_odometer_reading, return_odometer_reading, fuel_level_at_pickup, fuel_level_at_return, pickup_video_url, pickup_video_approved_by_customer, pickup_video_approved_by_owner, pickup_video_approved_at, return_video_url, return_video_approved_by_customer, return_video_approved_by_owner, return_video_approved_at, actual_return_time, is_late_return, late_return_minutes, late_return_charge, late_fee_waived, created_at) FROM stdin;
\.


--
-- Data for Name: agreement_acceptances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agreement_acceptances (id, user_id, agreement_type, booking_id, ip_address, user_agent, digital_signature, agreed_at) FROM stdin;
93cd9652-3d60-416c-816b-58d7e97832f0	c1746e46-b159-4f8f-8881-a3ca0511130c	owner_terms	\N	10.81.7.22	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Siddhartha Hati	2025-10-22 10:54:28.853097
\.


--
-- Data for Name: challans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.challans (id, vehicle_id, booking_id, challan_number, challan_date, challan_time, amount, reason, proof_url, status, paid_by_customer, uploaded_by_owner_id, created_at) FROM stdin;
\.


--
-- Data for Name: insurance_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.insurance_requests (id, owner_id, vehicle_id, insurance_type, coverage_amount, request_reason, status, admin_notes, contacted_at, resolved_at, created_at) FROM stdin;
\.


--
-- Data for Name: owner_addon_purchases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.owner_addon_purchases (id, owner_id, vehicle_id, addon_product_id, quantity, total_amount, payment_status, payment_intent_id, purchased_at) FROM stdin;
\.


--
-- Data for Name: owner_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.owner_addresses (id, owner_id, address_line_1, address_line_2, city, state, pincode, is_default, created_at) FROM stdin;
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ratings (id, booking_id, vehicle_id, rater_id, ratee_id, rating_type, rating, review, created_at) FROM stdin;
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referrals (id, referrer_id, referee_id, amount, status, expires_at, credited_at, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
bIzd3WOlZSbF2cSDVvJJz2MEyQCLA8oc	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-29T10:30:10.844Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "c1746e46-b159-4f8f-8881-a3ca0511130c"}	2025-10-29 11:51:42
\.


--
-- Data for Name: toll_fees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.toll_fees (id, booking_id, vehicle_id, customer_id, owner_id, amount, proof_url, description, status, paid_at, submitted_at) FROM stdin;
\.


--
-- Data for Name: vehicle_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicle_documents (id, vehicle_id, document_type, document_url, document_number, expiry_date, is_verified, verified_at, uploaded_at) FROM stdin;
\.


--
-- Data for Name: video_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.video_verifications (id, booking_id, video_url, uploaded_by, approved_by_customer, approved_by_owner, customer_approved_at, owner_approved_at, created_at) FROM stdin;
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_transactions (id, user_id, type, amount, balance_after, source, description, referral_id, booking_id, expires_at, created_at) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

