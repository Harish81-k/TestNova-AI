const { Server } = require('socket.io');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const setupSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    let currentProcess = null;

    socket.on('execute', async ({ code, language }) => {
      // Kill any running process
      if (currentProcess) {
        currentProcess.kill();
        currentProcess = null;
      }

      language = language.toLowerCase();
      
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'execute-'));
      
      try {
        let command = '';
        let args = [];
        
        if (language === 'python') {
          command = 'python';
          const filePath = path.join(tmpDir, 'script.py');
          fs.writeFileSync(filePath, code);
          // -u flag for unbuffered output
          args = ['-u', filePath];
        } 
        else if (language === 'javascript') {
          command = 'node';
          const filePath = path.join(tmpDir, 'script.js');
          fs.writeFileSync(filePath, code);
          args = [filePath];
        } 
        else if (language === 'java') {
          // Find the class name to name the file correctly
          const classNameMatch = code.match(/class\s+([a-zA-Z0-9_]+)/);
          const className = classNameMatch ? classNameMatch[1] : 'Main';
          const filePath = path.join(tmpDir, `${className}.java`);
          
          fs.writeFileSync(filePath, code);
          
          // Compile
          const compile = spawn('javac', [filePath]);
          await new Promise((resolve, reject) => {
            compile.on('error', (err) => reject(new Error(`Failed to start javac: ${err.message}`)));
            compile.on('close', (exitCode) => {
              if (exitCode === 0) resolve();
              else reject(new Error('Compilation failed'));
            });
            compile.stderr.on('data', (data) => socket.emit('output', data.toString()));
          });
          
          command = 'java';
          args = ['-cp', tmpDir, className];
        }
        else if (language === 'cpp') {
          const filePath = path.join(tmpDir, 'main.cpp');
          const outPath = path.join(tmpDir, 'a.exe'); // Windows default
          fs.writeFileSync(filePath, code);
          
          const compile = spawn('g++', [filePath, '-o', outPath]);
          await new Promise((resolve, reject) => {
            compile.on('error', (err) => reject(new Error(`Failed to start g++: ${err.message}`)));
            compile.on('close', (exitCode) => {
              if (exitCode === 0) resolve();
              else reject(new Error('Compilation failed'));
            });
            compile.stderr.on('data', (data) => socket.emit('output', data.toString()));
          });
          
          command = outPath;
          args = [];
        }
        else {
          socket.emit('output', `Language ${language} not supported for interactive execution.\n`);
          socket.emit('execution_end', { status: 'error' });
          return;
        }

        currentProcess = spawn(command, args);

        currentProcess.stdout.on('data', (data) => {
          socket.emit('output', data.toString());
        });

        currentProcess.stderr.on('data', (data) => {
          socket.emit('output', data.toString());
        });

        currentProcess.on('close', (exitCode) => {
          socket.emit('execution_end', { code: exitCode });
          currentProcess = null;
        });
        
        currentProcess.on('error', (err) => {
           socket.emit('output', `\nError: ${err.message}\n`);
           socket.emit('execution_end', { code: -1 });
        });

      } catch (error) {
        socket.emit('output', `\nError: ${error.message}\n`);
        socket.emit('execution_end', { status: 'error' });
      }
    });

    socket.on('input', (data) => {
      if (currentProcess && currentProcess.stdin) {
        currentProcess.stdin.write(data);
      }
    });
    
    socket.on('kill', () => {
        if (currentProcess) {
            currentProcess.kill();
            currentProcess = null;
            socket.emit('output', '\nProcess Terminated by user.\n');
        }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (currentProcess) {
        currentProcess.kill();
        currentProcess = null;
      }
    });
  });
};

module.exports = setupSockets;
