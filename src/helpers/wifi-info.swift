import CoreWLAN
import CoreLocation
import Foundation

class LocationManager: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var completion: (() -> Void)?

    override init() {
        super.init()
        manager.delegate = self
    }

    func requestPermissionAndGetWifi(completion: @escaping () -> Void) {
        self.completion = completion

        let status = manager.authorizationStatus

        switch status {
        case .notDetermined:
            // Request permission - this will show system dialog
            manager.requestWhenInUseAuthorization()
        case .authorizedAlways, .authorizedWhenInUse, .authorized:
            completion()
        case .denied, .restricted:
            // Permission denied, proceed anyway (SSID will be nil)
            completion()
        @unknown default:
            completion()
        }
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        // Called when authorization status changes
        completion?()
    }
}

func printWifiInfo() {
    guard let interface = CWWiFiClient.shared().interface() else {
        print("{\"error\": \"No WiFi interface found\"}")
        return
    }

    let powerOn = interface.powerOn()

    if !powerOn {
        print("{\"status\": \"off\"}")
        return
    }

    let ssid = interface.ssid() ?? ""
    let rssi = interface.rssiValue()
    let noise = interface.noiseMeasurement()
    let channel = interface.wlanChannel()?.channelNumber ?? 0

    if ssid.isEmpty {
        print("{\"status\": \"not-connected\"}")
        return
    }

    // Manually construct JSON to avoid issues with special characters
    let escapedSsid = ssid
        .replacingOccurrences(of: "\\", with: "\\\\")
        .replacingOccurrences(of: "\"", with: "\\\"")

    print("{\"status\":\"connected\",\"ssid\":\"\(escapedSsid)\",\"rssi\":\(rssi),\"noise\":\(noise),\"channel\":\(channel)}")
}

// For command line usage, just print the info
// Location permission is handled by the parent app's Info.plist
printWifiInfo()
