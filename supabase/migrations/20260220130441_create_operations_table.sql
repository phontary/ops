/*
  # Create Operations Table

  1. New Tables
    - `operations`
      - `id` (uuid, primary key) - Unique identifier for each operation
      - `op_id` (text, unique) - Operation ID (e.g., OP-2024-001)
      - `datum` (timestamptz) - Date of the operation
      - `patient_id` (text, nullable) - Hashed patient identifier
      - `diagnose` (text) - Medical diagnosis
      - `op_anlage` (text, nullable) - Operation facility
      - `anasthesie_typ` (text) - Type of anesthesia
      - `lagerung` (text, nullable) - Patient positioning
      - `op_team` (jsonb) - Array of team members
      - `op_verlauf` (text, nullable) - Operation procedure description
      - `pathologie_befund` (text, nullable) - Pathology findings
      - `dauer_min` (integer) - Duration in minutes
      - `blutverlust_ml` (integer, nullable) - Blood loss in milliliters
      - `materials` (jsonb) - Array of materials used
      - `times` (jsonb) - Array of time phases
      - `media` (jsonb) - Array of uploaded media files
      - `raw_ocr` (jsonb) - Raw OCR data
      - `stats_icd` (jsonb) - Array of ICD codes
      - `complete` (boolean) - Completion status
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `operations` table
    - Add policy for authenticated users to manage all operations
*/

CREATE TABLE IF NOT EXISTS operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  op_id text UNIQUE NOT NULL,
  datum timestamptz DEFAULT now(),
  patient_id text,
  diagnose text DEFAULT '',
  op_anlage text,
  anasthesie_typ text DEFAULT '',
  lagerung text,
  op_team jsonb DEFAULT '[]'::jsonb,
  op_verlauf text,
  pathologie_befund text,
  dauer_min integer DEFAULT 0,
  blutverlust_ml integer,
  materials jsonb DEFAULT '[]'::jsonb,
  times jsonb DEFAULT '[]'::jsonb,
  media jsonb DEFAULT '[]'::jsonb,
  raw_ocr jsonb DEFAULT '{}'::jsonb,
  stats_icd jsonb DEFAULT '[]'::jsonb,
  complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all operations"
  ON operations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert operations"
  ON operations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update operations"
  ON operations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete operations"
  ON operations
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_operations_datum ON operations(datum DESC);
CREATE INDEX IF NOT EXISTS idx_operations_op_id ON operations(op_id);
CREATE INDEX IF NOT EXISTS idx_operations_complete ON operations(complete);
