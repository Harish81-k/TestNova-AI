const body = {
  compiler: 'openjdk-jdk-22+36',
  code: 'public class Main { public static void main(String[] args) { System.out.println("hello with Main.java"); } }',
  codes: [{ file: 'Main.java', code: 'public class Main { public static void main(String[] args) { System.out.println("hello with Main.java"); } }' }]
};

fetch('https://wandbox.org/api/compile.json', {
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' }
}).then(res => res.json()).then(console.log);
