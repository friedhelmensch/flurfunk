-- Test script to verify the get_nearby_messages function works
-- Run this directly in your database to test the function

-- Test 1: Check if function exists
SELECT routine_name, data_type, parameter_name, parameter_default 
FROM information_schema.parameters 
WHERE routine_name = 'get_nearby_messages'
ORDER BY ordinal_position;

-- Test 2: Call the function with different radius values
-- Test with 5km radius (should work)
SELECT COUNT(*) as message_count, 'radius_5km' as test_type
FROM get_nearby_messages(40.7829, -73.9654, 5.0);

-- Test with 0.15km radius (150m)
SELECT COUNT(*) as message_count, 'radius_150m' as test_type
FROM get_nearby_messages(40.7829, -73.9654, 0.15);

-- Test with 0.05km radius (50m)
SELECT COUNT(*) as message_count, 'radius_50m' as test_type
FROM get_nearby_messages(40.7829, -73.9654, 0.05);

-- Test 3: Show actual messages with distances
SELECT id, text, distance_km
FROM get_nearby_messages(40.7829, -73.9654, 0.15)
ORDER BY distance_km;