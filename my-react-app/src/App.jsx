import { useState, useEffect } from "react";

function Examples() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");

  // 1. ทำงานครั้งแรกเท่านั้น
  useEffect(() => {
    console.log("Component mounted!");
  }, []);

  // 2. ทำงานทุกครั้งที่ count เปลี่ยน
  useEffect(() => {
    console.log(`📊 Count เปลี่ยนเป็น: ${count}`);
  }, [count]);

  // 3. ทำงานเมื่อ message เปลี่ยน
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`💬 Message: ${message}`);
    }, 2000);

    // Cleanup function
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎯 useEffect Examples</h1>

      <div>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="พิมพ์ข้อความ"
        />
        <p>Message: {message}</p>
      </div>

      <p style={{ color: "#999", fontSize: "12px" }}>
        ดูที่ Console (F12) เพื่อเห็น logs
      </p>
    </div>
  );
}

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users",
        );

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []); // ⚠️ [] (dependency ว่าง) = ทำงาน 1 ครั้ง

  if (loading) return <p>⏳ Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>👥 Users ({users.length})</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostsByUser() {
  const [userId, setUserId] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
      );
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    }

    fetchPosts();
  }, [userId]); // ⚠️ userId เปลี่ยน ทำงานเลย

  return (
    <div style={{ padding: "20px" }}>
      <div>
        <label>
          Select User:
          <select value={userId} onChange={(e) => setUserId(e.target.value)}>
            {[1, 2, 3, 4, 5].map((id) => (
              <option key={id} value={id}>
                User {id}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p>⏳ Loading posts...</p>}

      <h3>📝 Posts by User {userId}</h3>
      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "4px",
          }}
        >
          <h4>{post.title}</h4>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}

function Timer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return; // ถ้าไม่ run ไม่ต้อง set timer

    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    // Cleanup: ปลดปล่อย timer เมื่อ component unmount หรือ isRunning เปลี่ยน
    return () => {
      console.log("🧹 Cleanup timer");
      clearInterval(timer);
    };
  }, [isRunning]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>⏱️ Timer: {time}s</h2>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Stop" : "Start"}
      </button>
      <button onClick={() => setTime(0)}>Reset</button>
    </div>
  );
}

function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup: นำเอา event listener ออก
    return () => {
      console.log("🧹 นำเอา resize listener ออก");
      window.removeEventListener("resize", handleResize);
    };
  }, []); // ทำงาน 1 ครั้งเมื่อ mount แล้ว Cleanup ตอน unmount

  return (
    <div>
      <h2>📏 Window Width: {width}px</h2>
      <p>ลองเปลี่ยนขนาดหน้าต่างบราว์เซอร์ดู</p>
    </div>
  );
}

function SearchUsers() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // สร้าง AbortController เพื่อยกเลิก request ที่ค้างอยู่
    const controller = new AbortController();

    async function search() {
      setLoading(true);
      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users?q=${query}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        setResults(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }

    // Delay search เล็กน้อย (debounce)
    const timer = setTimeout(search, 500);

    // Cleanup
    return () => {
      clearTimeout(timer);
      controller.abort(); // ยกเลิก fetch ที่ยังค้าง
    };
  }, [query]);

  return (
    <div style={{ padding: "20px" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 ค้นหา users..."
      />

      {loading && <p>⏳ Searching...</p>}

      <ul>
        {results.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

function DataDashboard() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  // Effect 1: Fetch users
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  // Effect 2: Fetch posts
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((r) => r.json())
      .then(setPosts);
  }, []);

  // Effect 3: Fetch comments
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/comments")
      .then((r) => r.json())
      .then(setComments);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div style={{ border: "1px solid #ddd", padding: "10px" }}>
          <h3>👥 Users: {users.length}</h3>
        </div>
        <div style={{ border: "1px solid #ddd", padding: "10px" }}>
          <h3>📝 Posts: {posts.length}</h3>
        </div>
        <div style={{ border: "1px solid #ddd", padding: "10px" }}>
          <h3>💬 Comments: {comments.length}</h3>
        </div>
      </div>
    </div>
  );
}

function WeatherApp() {
  const [city, setCity] = useState("Bangkok");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      try {
        // ใช้ Open-Meteo API (ฟรี ไม่ต้อง API key)
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`,
        );
        const data = await response.json();

        if (data.results?.length > 0) {
          const { latitude, longitude } = data.results[0];

          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`,
          );
          const weatherData = await weatherResponse.json();
          setWeather(weatherData.current);
          setError(null);
        } else {
          setError("City not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🌦️ Weather App</h1>

      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city..."
      />

      {loading && <p>⏳ Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div style={{ marginTop: "20px", fontSize: "24px" }}>
          <h2>📍 {city}</h2>
          <p>🌡️ Temperature: {weather.temperature_2m}°C</p>
          <p>🌤️ Weather Code: {weather.weather_code}</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <>
      <Examples />
      <UserList />
      <PostsByUser />
      <Timer />
      <WindowSize />
      <SearchUsers />
      <DataDashboard />
      <WeatherApp />
    </>
  );
}
