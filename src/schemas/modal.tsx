
import { Code, Database, FileCode, FileJson } from "lucide-react"

// Sample generated code for different sections
export const sampleCode = {
  endpoints: {
    login: `@app.route("/api/auth/login", methods=["POST"])
def login():
    # Validate required fields
    data = request.json
    if not "email" or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400
        
    # Check database for user
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    }), 200`,
    users: `@app.route("/api/users", methods=["GET"])
def get_users():
    # Get query parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    # Fetch users with pagination
    users = User.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "users": [user.to_dict() for user in users.items],
        "total": users.total,
        "pages": users.pages,
        "current_page": users.page
    }), 200`,
    user_detail: `@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    # Validate user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Update user data
    data = request.json
    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        user.email = data["email"]
        
    db.session.commit()
    
    return jsonify({
        "message": "User updated successfully",
        "user": user.to_dict()
    }), 200`,
  },
  models: {
    user: `class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat()
        }`,
  },
  schemas: {
    user: `{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "The user's unique identifier"
    },
    "name": {
      "type": "string",
      "description": "The user's full name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "The user's email address"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "The timestamp when the user was created"
    }
  },
  "required": ["id", "name", "email", "created_at"]
}`,
  },
  config: {
    database: `# Database configuration
DB_CONFIG = {
    "development": {
        "SQLALCHEMY_DATABASE_URI": "sqlite:///dev.db",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    },
    "testing": {
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    },
    "production": {
        "SQLALCHEMY_DATABASE_URI": os.environ.get("DATABASE_URL"),
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    }
}

# Initialize database
db = SQLAlchemy(app)
`,
  },
}

// Helper function to get file icon based on type
export const getFileIcon = (type: string) => {
  switch (type) {
    case "endpoint":
      return <Code className="h-4 w-4 text-blue-400" />
    case "model":
      return <Database className="h-4 w-4 text-green-400" />
    case "schema":
      return <FileJson className="h-4 w-4 text-yellow-400" />
    case "config":
      return <FileCode className="h-4 w-4 text-purple-400" />
    case "migration":
      return <FileCode className="h-4 w-4 text-orange-400" />
    default:
      return <FileCode className="h-4 w-4 text-zinc-400" />
  }
}

// Helper function to get method badge
export const getMethodBadge = (path: string, method?: string) => {
  if (method) {
    const methodColors: Record<string, string> = {
      "GET": "bg-green-500/20 text-green-400",
      "POST": "bg-blue-500/20 text-blue-400",
      "PUT": "bg-yellow-500/20 text-yellow-400",
      "DELETE": "bg-red-500/20 text-red-400"
    }
    
    return <div className={`text-xs px-1.5 py-0.5 rounded font-medium ${methodColors[method] || "bg-zinc-500/20 text-zinc-400"}`}>
      {method}
    </div>
  }
  
  // Fallback logic
  if (path.includes("login")) {
    return <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-500/20 text-blue-400">POST</div>
  } else if (path === "/users") {
    return <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-500/20 text-green-400">GET</div>
  } else if (path.includes(":id")) {
    return <div className="text-xs px-1.5 py-0.5 rounded font-medium bg-yellow-500/20 text-yellow-400">PUT</div>
  }
  return null
}