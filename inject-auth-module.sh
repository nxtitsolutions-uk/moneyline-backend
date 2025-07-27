#!/bin/bash

# ------------------------------
# CONFIGURATION
# ------------------------------
REPO_URL="git@github.com:askHamzaSajjad/node-assets.git"
MODULE_NAME="auth"
CLONE_DIR=".auth_temp"
TARGET_PROJECT_DIR="$PWD"

echo "📂 Target project directory: $TARGET_PROJECT_DIR"

# ------------------------------
# STEP 1: CLEANUP OLD TEMP CLONE
# ------------------------------
rm -rf "$CLONE_DIR"

# ------------------------------
# STEP 2: CLONE MODULE REPO
# ------------------------------
echo "📥 Cloning $REPO_URL into $CLONE_DIR..."
git clone --depth=1 "$REPO_URL" "$CLONE_DIR" || { echo "❌ Clone failed"; exit 1; }

MODULE_PATH="$CLONE_DIR/$MODULE_NAME"

if [ ! -d "$MODULE_PATH" ]; then
  echo "❌ Module '$MODULE_NAME' not found at $MODULE_PATH"
  rm -rf "$CLONE_DIR"
  exit 1
fi

# ------------------------------
# STEP 3: COPY MODULE FILES
# ------------------------------
echo "📁 Found $MODULE_NAME module. Copying folders..."

for folder in controllers routes services utils middlewares config models; do
  SRC="$MODULE_PATH/$folder"
  DEST="$TARGET_PROJECT_DIR/$folder"

  if [ -d "$SRC" ]; then
    mkdir -p "$DEST"
    echo "📂 Copying from $SRC to $DEST"
    cp -rv "$SRC/"* "$DEST/"
  else
    echo "⚠️ Skipped $folder: not found"
  fi
done

# ------------------------------
# STEP 4: COPY server.js IF PRESENT
# ------------------------------
if [ -f "$MODULE_PATH/server.js" ]; then
  cp -v "$MODULE_PATH/server.js" "$TARGET_PROJECT_DIR/server.js"
else
  echo "⚠️ server.js not found in $MODULE_NAME"
fi

# ------------------------------
# STEP 5: INSTALL REQUIRED DEPENDENCIES
# ------------------------------
echo "📦 Installing required project dependencies..."

REQUIRED_DEPENDENCIES=(
  express
  dotenv
  cors
  mongoose
  morgan
  cookie-parser
  bcrypt
  jsonwebtoken
  express-validator
  uuid
  swagger-jsdoc
  swagger-ui-express
  winston
  google-auth-library
  apple-signin-auth
  nodemailer
  
)

REQUIRED_DEV_DEPENDENCIES=(
  nodemon
)

# Init project if no package.json
if [ ! -f "$TARGET_PROJECT_DIR/package.json" ]; then
  echo "📦 No package.json found. Initializing npm project..."
  npm init -y
fi

# Install regular dependencies
for dep in "${REQUIRED_DEPENDENCIES[@]}"; do
  echo "📥 Installing $dep..."
  npm install "$dep"
done

# Install dev dependencies
for dev_dep in "${REQUIRED_DEV_DEPENDENCIES[@]}"; do
  echo "🛠 Installing dev dependency $dev_dep..."
  npm install --save-dev "$dev_dep"
done

echo "✅ All dependencies installed."

# ------------------------------
# STEP 6: CREATE .env.example AND .gitignore
# ------------------------------
cat <<EOF > "$TARGET_PROJECT_DIR/.env.example"
# Server Configuration
PORT=3500
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://your_mongo_user:your_mongo_password@your_cluster.mongodb.net/your_db_name

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MESSAGE_SECRET_KEY=your_message_secret_key

# Email (Nodemailer)
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_app_password

# OAuth Clients
GOOGLE_CLIENT_ID=your_google_client_id
APPLE_CLIENT_ID=your_apple_client_id
EOF

echo "✅ .env.example created with sample values"

echo "✅ .env.example created"

cat <<EOF > "$TARGET_PROJECT_DIR/.gitignore"
# Node modules
node_modules/

# Environment
.env

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS Files
.DS_Store
Thumbs.db
EOF
echo "✅ .gitignore created"

# ------------------------------
# STEP 7: CLEANUP TEMP FOLDER
# ------------------------------
rm -rf "$CLONE_DIR"
echo "✅ Injection complete. '$MODULE_NAME' module and environment setup ready."
