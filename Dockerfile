FROM eclipse-temurin:17

ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl wget unzip git procps build-essential zip libx11-6 && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

# Install Android command line tools
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    cd /tmp && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip -O cmdline-tools.zip && \
    unzip cmdline-tools.zip -d ${ANDROID_SDK_ROOT}/cmdline-tools && \
    mv ${ANDROID_SDK_ROOT}/cmdline-tools/cmdline-tools ${ANDROID_SDK_ROOT}/cmdline-tools/latest && \
    rm cmdline-tools.zip

# Make sure sdkmanager can be used non-interactively
RUN yes | sdkmanager --licenses || true

# Install emulator for NativeScript just to pass CLI check
RUN sdkmanager "emulator" "platform-tools"

# Install NativeScript CLI
RUN npm install -g nativescript@latest && ns error-reporting disable && ns usage-reporting disable

WORKDIR /workspace

CMD ["bash"]
