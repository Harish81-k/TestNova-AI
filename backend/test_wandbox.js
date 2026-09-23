const fetch = require('node-fetch'); // wait, node >= 18 has fetch built in.

async function test() {
  const code = `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
  `;
  
  // Test 1: strip public
  const code2 = `
class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
  `;
  
  const response = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      compiler: 'openjdk-jdk-22+36',
      code: code2
    })
  });
  
  console.log(await response.json());
}

test();
